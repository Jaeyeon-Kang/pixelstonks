import { useEffect, useRef, useState } from 'react';
import type { GameState, ProfitTier } from '../types';
import { submitScore } from '../services/leaderboard';
import { GAME_CONFIG } from '../config/gameConfig';

interface ResultScreenProps {
  state: GameState;
  onRestart: () => void;
  onHome: () => void;
  onRanking: () => void;
}

function getTier(profitRate: number): ProfitTier {
  if (profitRate >= 15) return 'legend';
  if (profitRate >= 8) return 'beast';
  if (profitRate >= 2) return 'normal';
  if (profitRate >= -2) return 'meh';
  if (profitRate >= -8) return 'ant';
  if (profitRate >= -15) return 'dead';
  return 'doom';
}

const TIER_INFO: Record<ProfitTier, { label: string; mark: string }> = {
  legend: { label: '전설의 단타왕', mark: '★★★' },
  beast: { label: '야수의 심장', mark: '★★' },
  normal: { label: '쏠쏠한 수익', mark: '★' },
  meh: { label: '본전치기', mark: '-' },
  ant: { label: '개미의 눈물', mark: '▼' },
  dead: { label: '깡통계좌', mark: '▼▼' },
  doom: { label: '전설의 손실', mark: '▼▼▼' },
};

const MEME_POOL: Record<ProfitTier, string[]> = {
  legend: [
    '금감원에서 연락 올 듯',
    '오늘 점심은 한우 가즈아~',
    'Stonks!!! 📈📈📈',
    '슈퍼개미 등극 ㅋㅋ',
    '단타로 따상 찍는 사람',
    '천재 아니면 운빨... 아무튼 수익',
    '이거 실화? 수익 인증 가능?',
    '주포가 나였다',
  ],
  beast: [
    '야수의 심장 인증 완료',
    '칼매수 칼매도 장인',
    '오늘 저녁은 스시다',
    '이 정도면 프로 개미',
    '눌림목 잡기 성공',
    '불타기까지 했으면 전설이었다',
    '동학개미의 자존심',
    '존버 안 해도 되는 인생',
  ],
  normal: [
    '치킨값은 벌었다',
    '예금 이자보단 낫지',
    '커피값 정도는 나왔음',
    '적당히 익절... 국룰이다',
    '탈출 성공 그 자체',
    '소소하지만 확실한 수익',
    '이 맛에 단타 하는 거다',
    '용돈 벌이 완료',
  ],
  meh: [
    '수수료만 증권사에 바침',
    '시간 도둑 당했다',
    '사팔사팔 하다 본전',
    '차라리 적금이 나았다',
    '헛짓거리의 정석',
    '거래세 낸 것만 아까움',
    '매매한 흔적만 남음',
    '뇌동매매의 결과',
  ],
  ant: [
    '개미는 오늘도 눈물...',
    '양방향으로 쳐맞는 중',
    '물타기 할까 말까 고민만 하다 끝남',
    '존버가 답이었는데...',
    '사면 내리고 팔면 오르고',
    '개미털기 당한 느낌',
    'not stonks... 📉',
    '잠깐 쉬어가는 거다 (아님)',
  ],
  dead: [
    '반대매매 직전 체험',
    '계좌가 반토막 났습니다',
    '다음 생엔 공무원 하자',
    '설거지 당한 느낌',
    '손절이 곧 수익이었다',
    '깡통계좌 입문 축하드립니다',
    '엄마한테 절대 말하지 마',
    '가문의 수치',
  ],
  doom: [
    '앱 삭제 강력 추천',
    '영끌했으면 큰일 날 뻔',
    '전재산 증발 시뮬레이션 완료',
    '이 종목을 산 게 잘못이다',
    '주식 접고 치킨집 알아보세요',
    '다시는 안 해... (내일 또 함)',
    '차트 보는 눈이 없습니다',
    '빚투 안 한 게 다행이다',
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const IDLE_MEMES = [
  '차트만 구경하고 갑니다',
  '매수 버튼이 어디 있었죠?',
  '관망도 전략이다 (진짜?)',
  '손 안 대면 잃지 않는다... 벌지도 않지만',
  '눈으로만 매매 완료',
  '종이 위의 천재 투자자',
  '겁쟁이라서 살아남았다',
  '구경은 공짜니까요',
];

export function ResultScreen({ state, onRestart, onHome, onRanking }: ResultScreenProps) {
  const profitRate = state.finalProfitRate ?? 0;
  // 한 번도 매수하지 않았는지 체크 (매매권 3개 그대로)
  const neverBought = state.tradesLeft === GAME_CONFIG.maxTrades;
  const tier = neverBought ? 'meh' as ProfitTier : getTier(profitRate);
  const tierInfo = neverBought ? { label: '구경만 함', mark: '👀' } : TIER_INFO[tier];
  const memeRef = useRef(neverBought ? pickRandom(IDLE_MEMES) : pickRandom(MEME_POOL[tier]));
  const profitClass = profitRate >= 0 ? 'profit-positive' : 'profit-negative';
  const profitSign = profitRate >= 0 ? '+' : '';

  const pnl = Math.round(GAME_CONFIG.initialPrice * profitRate / 100);
  const pnlSign = pnl >= 0 ? '+' : '';
  const finalBalance = GAME_CONFIG.initialPrice + pnl;

  const [myRank, setMyRank] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current) return;
    if (!state.character || !state.scenario) return;
    submitted.current = true;
    setSubmitting(true);
    submitScore(profitRate, state.character.id, state.scenario.id)
      .then(({ rank }) => setMyRank(rank))
      .finally(() => setSubmitting(false));
  }, [profitRate, state.character, state.scenario]);

  return (
    <div className="result">
      {/* 결과 카드 */}
      <div className="result-card pixel-panel">
        <div className="result-header">
          <span className="result-emoji">{state.character?.emoji}</span>
          <span className="result-verdict">
            {neverBought ? '관망...' : profitRate > 0 ? '승리!' : profitRate === 0 ? '본전' : '패배...'}
          </span>
        </div>

        <div className={`result-rate ${profitClass}`}>
          {profitSign}{profitRate.toFixed(1)}%
        </div>

        <div className="result-pnl">
          <span className="result-pnl-label">최종 잔액</span>
          <span className={`result-pnl-amount ${profitClass}`}>
            {finalBalance.toLocaleString()}P ({pnlSign}{pnl.toLocaleString()}P)
          </span>
        </div>

        <div className="result-meme">"{memeRef.current}"</div>
        <div className="result-divider" />

        <div className="result-tier">
          {tierInfo.mark} {tierInfo.label}
        </div>

        <div className="result-meta">
          <span>종목: {state.character?.name}</span>
          <span>패턴: {state.scenario?.nameKo}</span>
        </div>

        {submitting && <div className="result-loading">순위 집계 중...</div>}
        {myRank !== null && (
          <div className="result-rank" onClick={onRanking}>
            <span>오늘의 순위</span>
            <span className="result-rank-num">#{myRank}</span>
            <span className="result-rank-go">{'>'} 랭킹</span>
          </div>
        )}
      </div>

      {/* 버튼 */}
      <div className="result-actions">
        <button className="btn-retro btn-pixel result-share" onClick={() => alert('앱인토스 SDK 연동 후 활성화')}>
          SHARE
        </button>
        <div className="result-sub">
          <button className="btn-retro btn-sub result-sub-btn" onClick={onRestart}>RETRY</button>
          <button className="btn-retro btn-sub result-sub-btn" onClick={onHome}>HOME</button>
        </div>
      </div>

      <style>{`
        .result {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 20px;
        }
        .result-card {
          width: 100%;
          max-width: 320px;
          padding: 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .result-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .result-emoji { font-size: 32px; }
        .result-verdict {
          font-size: 14px;
          color: var(--text);
        }
        .result-rate {
          font-family: var(--font-en);
          font-size: 36px;
          line-height: 1.2;
        }
        .result-pnl {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .result-pnl-label {
          font-size: 10px;
          color: var(--muted);
        }
        .result-pnl-amount {
          font-family: var(--font-en);
          font-size: 13px;
        }
        .result-meme {
          font-size: 12px;
          color: var(--text-sub);
        }
        .result-divider {
          width: 60%;
          height: 1px;
          background: var(--border);
          margin: 2px auto;
        }
        .result-tier {
          font-size: 14px;
          color: var(--accent);
        }
        .result-meta {
          font-size: 11px;
          color: var(--muted);
          display: flex;
          justify-content: center;
          gap: 14px;
        }
        .result-loading {
          font-size: 10px;
          color: var(--muted);
          animation: blink 1s infinite;
        }
        .result-rank {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 8px 14px;
          background: rgba(243,156,18,0.08);
          border: 1px solid rgba(243,156,18,0.2);
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          color: var(--text-sub);
        }
        .result-rank:active { background: rgba(243,156,18,0.15); }
        .result-rank-num {
          font-family: var(--font-en);
          font-size: 18px;
          color: var(--accent);
        }
        .result-rank-go {
          font-family: var(--font-en);
          font-size: 9px;
          color: var(--muted);
        }
        .result-actions {
          width: 100%;
          max-width: 320px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .result-share {
          width: 100%;
          height: 48px;
          font-family: var(--font-en);
          font-size: 14px;
          letter-spacing: 2px;
        }
        .result-sub {
          display: flex;
          gap: 8px;
        }
        .result-sub-btn {
          flex: 1;
          height: 42px;
          font-family: var(--font-en);
          font-size: 11px;
          border-radius: 4px;
          border: 2px solid;
        }
      `}</style>
    </div>
  );
}
