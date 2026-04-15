interface HomeScreenProps {
  onStart: () => void;
  onRanking: () => void;
  bestScore: number | null;
  totalGames: number;
  nickname: string | null;
  onChangeNick: () => void;
}

export function HomeScreen({ onStart, onRanking, bestScore, totalGames, nickname, onChangeNick }: HomeScreenProps) {
  return (
    <div className="home">
      <div className="home-content">
        <div className="home-title-area">
          <div className="home-sub-top">- 방구석 -</div>
          <h1 className="home-title">픽셀단타왕</h1>
          <div className="home-sub-en">PIXEL STONKS</div>
          <div className="home-chart-deco">
          <span className="bar b1" /><span className="bar b2" /><span className="bar b3" />
          <span className="bar b4" /><span className="bar b5" /><span className="bar b6" />
          <span className="bar b7" />
        </div>
        </div>

        <button className="btn-retro btn-pixel home-start" onClick={onStart}>
          {'>'} 시작하기
        </button>

        <button className="btn-retro btn-sub home-ranking" onClick={onRanking}>
          랭킹
        </button>

        <div className="home-stats">
          {bestScore !== null && (
            <div className={bestScore >= 0 ? 'profit-positive' : 'profit-negative'}>
              BEST: {bestScore >= 0 ? '+' : ''}{bestScore.toFixed(1)}%
            </div>
          )}
          <div className="home-games">GAMES: {totalGames}</div>
        </div>

        {nickname && (
          <div className="home-nick" onClick={onChangeNick}>
            {nickname} ✎
          </div>
        )}
        <div className="home-hint">30초 · 매매 3회 · 수익률 경쟁</div>
      </div>

      <style>{`
        .home { height: 100%; position: relative; }
        .home-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          padding: 40px 24px;
        }
        .home-title-area { text-align: center; }
        .home-sub-top {
          font-size: 13px;
          color: var(--text-sub);
          margin-bottom: 6px;
          letter-spacing: 4px;
        }
        .home-title {
          font-size: 28px;
          color: var(--text);
          margin: 0;
          letter-spacing: 2px;
          line-height: 1.5;
        }
        .home-sub-en {
          font-family: var(--font-en);
          font-size: 10px;
          color: var(--muted);
          margin-top: 6px;
          letter-spacing: 5px;
        }
        .home-chart-deco {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 4px;
          margin-top: 14px;
          height: 28px;
        }
        .bar {
          width: 6px;
          border-radius: 2px 2px 0 0;
          animation: barPulse 2.5s ease-in-out infinite;
        }
        .b1 { height: 12px; background: var(--profit); animation-delay: 0s; }
        .b2 { height: 20px; background: var(--profit); animation-delay: 0.15s; }
        .b3 { height: 16px; background: var(--loss); animation-delay: 0.3s; }
        .b4 { height: 24px; background: var(--profit); animation-delay: 0.45s; }
        .b5 { height: 10px; background: var(--loss); animation-delay: 0.6s; }
        .b6 { height: 18px; background: var(--profit); animation-delay: 0.75s; }
        .b7 { height: 28px; background: var(--green); animation-delay: 0.9s; }
        @keyframes barPulse {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.5); }
        }
        .home-start {
          width: 220px;
          height: 54px;
          font-family: var(--font-en);
          font-size: 16px;
          letter-spacing: 4px;
          margin-top: 8px;
        }
        .home-ranking {
          width: 180px;
          height: 40px;
          font-family: var(--font-en);
          font-size: 11px;
          letter-spacing: 2px;
        }
        .home-stats {
          font-family: var(--font-en);
          font-size: 11px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .home-games {
          color: var(--muted);
          font-size: 10px;
        }
        .home-nick {
          font-size: 11px;
          color: var(--text-sub);
          cursor: pointer;
          padding: 4px 10px;
          border-radius: 4px;
          border: 1px solid var(--border);
          background: var(--surface);
        }
        .home-nick:active { background: var(--bg-deep); }
        .home-hint {
          font-size: 11px;
          color: var(--muted);
          position: absolute;
          bottom: 28px;
        }
      `}</style>
    </div>
  );
}
