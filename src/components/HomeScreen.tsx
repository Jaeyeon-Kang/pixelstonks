interface HomeScreenProps {
  onStart: () => void;
  onRanking: () => void;
  bestScore: number | null;
  totalGames: number;
}

export function HomeScreen({ onStart, onRanking, bestScore, totalGames }: HomeScreenProps) {
  return (
    <div className="home">
      {/* 배경 장식: 미니 캔들차트 패턴 */}
      <div className="home-bg-pattern" />

      <div className="home-content">
        {/* 타이틀 */}
        <div className="home-title-area">
          <div className="home-subtitle-top">방구석</div>
          <h1 className="home-title">픽셀단타왕</h1>
          <div className="home-subtitle">PIXEL STONKS</div>
          <div className="home-chart-deco">
            📈📉📈📉📈
          </div>
        </div>

        {/* 스타트 버튼 */}
        <button className="btn-retro btn-pixel home-start-btn" onClick={onStart}>
          ▶ START
        </button>

        {/* 랭킹 버튼 */}
        <button className="btn-retro btn-pixel home-ranking-btn" onClick={onRanking}>
          🏆 RANKING
        </button>

        {/* 통계 */}
        <div className="home-stats">
          {bestScore !== null && (
            <div className={bestScore >= 0 ? 'profit-positive' : 'profit-negative'}>
              BEST: {bestScore >= 0 ? '+' : ''}{bestScore.toFixed(1)}%
            </div>
          )}
          <div className="home-games">GAMES: {totalGames}</div>
        </div>

        {/* 하단 안내 */}
        <div className="home-hint">
          30초 · 매매 3회 · 수익률 경쟁
        </div>
      </div>

      <style>{`
        .home {
          height: 100%;
          position: relative;
          overflow: hidden;
        }
        .home-bg-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background:
            repeating-linear-gradient(
              90deg,
              var(--muted) 0px,
              var(--muted) 1px,
              transparent 1px,
              transparent 14px
            );
        }
        .home-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 40px 24px;
        }
        .home-title-area {
          text-align: center;
        }
        .home-subtitle-top {
          font-family: var(--font-pixel);
          font-size: 12px;
          color: var(--gb-lightest);
          margin-bottom: 8px;
          letter-spacing: 8px;
          opacity: 0.7;
        }
        .home-title {
          font-family: var(--font-pixel);
          font-size: 22px;
          color: var(--gb-lightest);
          margin: 0;
          letter-spacing: 4px;
          animation: pulseGlow 3s ease-in-out infinite;
          line-height: 1.6;
        }
        .home-subtitle {
          font-family: var(--font-pixel);
          font-size: 10px;
          color: var(--gb-light);
          margin-top: 8px;
          letter-spacing: 8px;
          opacity: 0.6;
        }
        .home-chart-deco {
          margin-top: 16px;
          font-size: 18px;
          letter-spacing: 4px;
          animation: float 4s ease-in-out infinite;
        }
        .home-start-btn {
          width: 220px;
          height: 60px;
          font-size: 18px;
          letter-spacing: 6px;
          margin-top: 8px;
        }
        .home-start-btn:hover {
          background: var(--gb-lightest);
        }
        .home-ranking-btn {
          width: 180px;
          height: 40px;
          font-size: 10px;
          letter-spacing: 3px;
          background: var(--surface);
          border-color: var(--accent);
          border-bottom-color: #8a6e10;
          border-right-color: #8a6e10;
          color: var(--accent);
        }
        .home-ranking-btn:active {
          background: rgba(255,207,64,0.1);
        }
        .home-stats {
          font-family: var(--font-pixel);
          font-size: 10px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .home-games {
          color: var(--muted);
          font-size: 9px;
        }
        .home-hint {
          font-family: var(--font-pixel);
          font-size: 7px;
          color: var(--muted);
          letter-spacing: 2px;
          text-align: center;
          position: absolute;
          bottom: 32px;
        }
      `}</style>
    </div>
  );
}
