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
  if (profitRate >= 500) return 'legend';
  if (profitRate >= 200) return 'beast';
  if (profitRate >= 50) return 'normal';
  if (profitRate >= -20) return 'meh';
  if (profitRate >= -50) return 'ant';
  if (profitRate >= -90) return 'dead';
  return 'doom';
}

const TIER_INFO: Record<ProfitTier, { label: string; mark: string }> = {
  legend: { label: '전설의 단타왕', mark: '★★★' },
  beast: { label: '야수의 심장', mark: '★★' },
  normal: { label: '평타 이상', mark: '★' },
  meh: { label: '그저 그럼', mark: '-' },
  ant: { label: '개미의 삶', mark: '▼' },
  dead: { label: '깡통계좌', mark: '▼▼' },
  doom: { label: '전설의 패배', mark: '▼▼▼' },
};

const MEME_POOL: Record<ProfitTier, string[]> = {
  legend: ['워렌버핏이 기립박수', '오늘의 단타왕 등극', 'Stonks!!!', '금감원에서 연락 갈지도'],
  beast: ['야수의 심장 인증', '재능충 등판', '이쯤이면 단타 금지령', '침팬지가 예언한 그분'],
  normal: ['평타는 쳤네 뭐', '운빨 오졌다', '예금 이자보단 나음', '나쁘지 않음 인정'],
  meh: ['침팬지와 동일한 수익률', '차라리 적금을 해라', '가위바위보만도 못함', '시장 수익률 못 이김'],
  ant: ['이게 바로 개미의 삶', '엄마가 보면 우심', 'not stonks...', '존버만이 살길이었는데'],
  dead: ['가문의 수치', '다음 생엔 공무원', '반대매매 강제청산', '깡통계좌 입문'],
  doom: ['앱 지우는 게 정신건강에 좋습니다', '워렌버핏이 쿠팡맨으로 재취업', '주식은 이제 그만...'],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const IDLE_MEMES = [
  '차트만 구경하고 갑니다',
  '매수 버튼이 어디 있었죠?',
  '관망도 전략이다 (진짜?)',
  '손 안 대면 잃지 않는다... 벌지도 않지만',
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
