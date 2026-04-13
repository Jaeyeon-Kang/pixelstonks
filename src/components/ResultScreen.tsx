import { useEffect, useRef, useState } from 'react';
import type { GameState, ProfitTier } from '../types';
import { submitScore } from '../services/leaderboard';

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

const TIER_INFO: Record<ProfitTier, { label: string; emoji: string }> = {
  legend: { label: '전설의 단타왕', emoji: '🏆' },
  beast: { label: '야수의 심장', emoji: '🥇' },
  normal: { label: '평타 이상', emoji: '😊' },
  meh: { label: '그저 그럼', emoji: '😐' },
  ant: { label: '개미의 삶', emoji: '😢' },
  dead: { label: '깡통계좌', emoji: '💀' },
  doom: { label: '전설의 패배', emoji: '🪦' },
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

export function ResultScreen({ state, onRestart, onHome, onRanking }: ResultScreenProps) {
  const profitRate = state.finalProfitRate ?? 0;
  const tier = getTier(profitRate);
  const tierInfo = TIER_INFO[tier];
  const memeRef = useRef(pickRandom(MEME_POOL[tier]));
  const profitClass = profitRate >= 0 ? 'profit-positive' : 'profit-negative';
  const profitSign = profitRate >= 0 ? '+' : '';
  const isWin = profitRate > 0;

  // 리더보드 제출
  const [myRank, setMyRank] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current) return;
    if (!state.character || !state.scenario) return;
    submitted.current = true;
    setSubmitting(true);

    submitScore(profitRate, state.character.id, state.scenario.id)
      .then(({ rank }) => {
        setMyRank(rank);
      })
      .finally(() => setSubmitting(false));
  }, [profitRate, state.character, state.scenario]);

  return (
    <div className="result">
      {/* 캐릭터 */}
      <div className="result-char">
        <span className="result-char-emoji">{state.character?.emoji}</span>
        <span className="result-char-verdict">{isWin ? '승리!' : '패배...'}</span>
      </div>

      {/* 결과 카드 */}
      <div className="result-card">
        <div className={`result-rate ${profitClass}`}>
          {profitSign}{profitRate.toFixed(1)}%
        </div>
        <div className="result-meme">"{memeRef.current}"</div>
        <div className="result-divider" />
        <div className="result-tier">
          {tierInfo.emoji} {tierInfo.label}
        </div>
        <div className="result-meta">
          <span>종목: {state.character?.name}</span>
          <span>패턴: {state.scenario?.nameKo}</span>
        </div>

        {/* 랭킹 표시 */}
        {submitting && (
          <div className="result-rank-loading">순위 계산 중...</div>
        )}
        {myRank !== null && (
          <div className="result-rank" onClick={onRanking}>
            <span className="result-rank-label">오늘의 순위</span>
            <span className="result-rank-num">#{myRank}</span>
            <span className="result-rank-hint">랭킹 보기 &gt;</span>
          </div>
        )}
      </div>

      {/* 버튼들 */}
      <div className="result-actions">
        <button className="btn-retro btn-pixel result-share-btn" onClick={() => alert('앱인토스 SDK 연동 후 활성화')}>
          📱 공유하기
        </button>
        <div className="result-sub-actions">
          <button className="btn-retro btn-pixel btn-hold result-sub-btn" onClick={onRestart}>
            🔄 다시하기
          </button>
          <button className="btn-retro btn-pixel btn-hold result-sub-btn" onClick={onHome}>
            🏠 홈으로
          </button>
        </div>
      </div>

      <style>{`
        .result {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-evenly;
          gap: 12px;
          padding: 24px 20px;
        }
        .result-char {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .result-char-emoji {
          font-size: 56px;
          animation: float 2s ease-in-out infinite;
          display: block;
        }
        .result-char-verdict {
          font-family: var(--font-pixel);
          font-size: 10px;
          color: var(--gb-light);
        }
        .result-card {
          width: 100%;
          max-width: 320px;
          border: 2px solid var(--gb-light);
          border-bottom-color: var(--surface);
          border-right-color: var(--surface);
          padding: 20px 16px;
          text-align: center;
          background: var(--surface);
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow:
            inset 0 0 15px rgba(0,0,0,0.2),
            0 4px 0 rgba(0,0,0,0.2);
          border-radius: 4px;
        }
        .result-rate {
          font-family: var(--font-pixel);
          font-size: 28px;
          line-height: 1.4;
        }
        .result-meme {
          font-family: var(--font-pixel);
          font-size: 8px;
          color: var(--gb-lightest);
          line-height: 1.8;
          opacity: 0.8;
        }
        .result-divider {
          width: 60%;
          height: 1px;
          background: var(--muted);
          margin: 2px auto;
          opacity: 0.4;
        }
        .result-tier {
          font-family: var(--font-pixel);
          font-size: 10px;
          color: var(--accent);
          text-shadow: 0 0 6px rgba(255,215,0,0.4);
        }
        .result-meta {
          font-family: var(--font-pixel);
          font-size: 7px;
          color: var(--muted);
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        /* 랭킹 표시 */
        .result-rank-loading {
          font-family: var(--font-pixel);
          font-size: 7px;
          color: var(--muted);
          animation: blink 1s infinite;
        }
        .result-rank {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 12px;
          margin-top: 4px;
          background: rgba(255,207,64,0.08);
          border: 1px solid rgba(255,207,64,0.2);
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .result-rank:active {
          background: rgba(255,207,64,0.15);
        }
        .result-rank-label {
          font-family: var(--font-pixel);
          font-size: 7px;
          color: var(--gb-lightest);
        }
        .result-rank-num {
          font-family: var(--font-pixel);
          font-size: 16px;
          color: var(--accent);
          text-shadow: 0 0 8px rgba(255,207,64,0.5);
          animation: pulseGlow 2s infinite;
        }
        .result-rank-hint {
          font-family: var(--font-pixel);
          font-size: 6px;
          color: var(--muted);
        }

        .result-actions {
          width: 100%;
          max-width: 320px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .result-share-btn {
          width: 100%;
          height: 48px;
          font-size: 11px;
        }
        .result-sub-actions {
          display: flex;
          gap: 8px;
        }
        .result-sub-btn {
          flex: 1;
          height: 40px;
          font-size: 9px;
          padding: 8px;
        }
      `}</style>
    </div>
  );
}
