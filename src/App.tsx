import { useState, useEffect, useCallback } from 'react';
import { useGameLoop } from './game/useGameLoop';
import { HomeScreen } from './components/HomeScreen';
import { MatchingScreen } from './components/MatchingScreen';
import { PlayScreen } from './components/PlayScreen';
import { ResultScreen } from './components/ResultScreen';
import { RankingScreen } from './components/RankingScreen';

function loadStats(): { bestScore: number | null; totalGames: number } {
  try {
    const raw = localStorage.getItem('pixel-stonks-stats');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { bestScore: null, totalGames: 0 };
}

function saveStats(bestScore: number | null, totalGames: number) {
  localStorage.setItem('pixel-stonks-stats', JSON.stringify({ bestScore, totalGames }));
}

export default function App() {
  const { state, startGame, executeTrade, goHome } = useGameLoop();
  const [stats, setStats] = useState(loadStats);
  const [showRanking, setShowRanking] = useState(false);

  const openRanking = useCallback(() => setShowRanking(true), []);
  const closeRanking = useCallback(() => setShowRanking(false), []);

  useEffect(() => {
    if (state.phase === 'RESULT' && state.finalProfitRate !== null) {
      setStats((prev) => {
        const newBest = prev.bestScore === null
          ? state.finalProfitRate!
          : Math.max(prev.bestScore, state.finalProfitRate!);
        const newTotal = prev.totalGames + 1;
        saveStats(newBest, newTotal);
        return { bestScore: newBest, totalGames: newTotal };
      });
    }
  }, [state.phase, state.finalProfitRate]);

  // 화면 키: 랭킹이면 'RANKING', 아니면 게임 phase
  const screenKey = showRanking ? 'RANKING' : state.phase;

  return (
    <div className="app-root">
      <div className="game-frame">
        {/* CRT 효과 오버레이 */}
        <div className="scanlines" />
        <div className="vignette" />

        {/* 화면 라우팅 */}
        <div className="screen-container screen-enter" key={screenKey}>
          {showRanking ? (
            <RankingScreen onBack={closeRanking} />
          ) : (
            <>
              {state.phase === 'HOME' && (
                <HomeScreen
                  onStart={startGame}
                  onRanking={openRanking}
                  bestScore={stats.bestScore}
                  totalGames={stats.totalGames}
                />
              )}
              {state.phase === 'MATCHING' && state.character && (
                <MatchingScreen character={state.character} scenario={state.scenario} />
              )}
              {state.phase === 'PLAYING' && (
                <PlayScreen state={state} onTrade={executeTrade} />
              )}
              {state.phase === 'RESULT' && (
                <ResultScreen
                  state={state}
                  onRestart={startGame}
                  onHome={goHome}
                  onRanking={openRanking}
                />
              )}
            </>
          )}
        </div>

        {/* 법적 고지 */}
        <div className="disclaimer">
          오락 목적 시뮬레이션 · 실제 금융상품과 무관
        </div>
      </div>

      <style>{`
        .app-root {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
        }
        .game-frame {
          width: 390px;
          height: 100vh;
          max-width: 100vw;
          background: var(--gb-darkest);
          color: var(--gb-light);
          overflow: hidden;
          position: relative;
          border: 1px solid var(--gb-dark);
          box-shadow: 0 0 30px rgba(42, 46, 63, 0.4);
        }
        .screen-container {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        .disclaimer {
          position: absolute;
          bottom: 6px;
          left: 0;
          right: 0;
          text-align: center;
          font-family: var(--font-pixel);
          font-size: 6px;
          color: var(--muted);
          z-index: 20;
        }
      `}</style>
    </div>
  );
}
