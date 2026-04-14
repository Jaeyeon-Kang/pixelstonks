import { useState, useEffect, useCallback } from 'react';
import { useGameLoop } from './game/useGameLoop';
import { HomeScreen } from './components/HomeScreen';
import { MatchingScreen } from './components/MatchingScreen';
import { PlayScreen } from './components/PlayScreen';
import { ResultScreen } from './components/ResultScreen';
import { RankingScreen } from './components/RankingScreen';
import { NicknameModal } from './components/NicknameModal';
import { loadNickname } from './utils/nickname';

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
  const [showNickModal, setShowNickModal] = useState(false);
  const [nickname, setNickname] = useState<string | null>(loadNickname);

  const openRanking = useCallback(() => setShowRanking(true), []);
  const closeRanking = useCallback(() => setShowRanking(false), []);

  // START 클릭 → 닉네임 없으면 모달, 있으면 바로 게임
  const handleStart = useCallback(() => {
    if (!nickname) {
      setShowNickModal(true);
    } else {
      startGame();
    }
  }, [nickname, startGame]);

  // 닉네임 확인 후 게임 시작
  const handleNicknameConfirm = useCallback((nick: string) => {
    setNickname(nick);
    setShowNickModal(false);
    startGame();
  }, [startGame]);

  // 닉네임 변경 (홈에서 터치)
  const [nickEditMode, setNickEditMode] = useState(false);
  const handleChangeNick = useCallback(() => setNickEditMode(true), []);
  const handleNickEditConfirm = useCallback((nick: string) => {
    setNickname(nick);
    setNickEditMode(false);
  }, []);

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
                  onStart={handleStart}
                  onRanking={openRanking}
                  bestScore={stats.bestScore}
                  totalGames={stats.totalGames}
                  nickname={nickname}
                  onChangeNick={handleChangeNick}
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
                  onRestart={handleStart}
                  onHome={goHome}
                  onRanking={openRanking}
                />
              )}
            </>
          )}
        </div>

        {/* 닉네임 입력 모달 */}
        {showNickModal && (
          <NicknameModal onConfirm={handleNicknameConfirm} />
        )}
        {nickEditMode && (
          <NicknameModal onConfirm={handleNickEditConfirm} />
        )}
      </div>

      <style>{`
        .app-root {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-deep);
        }
        .game-frame {
          width: 390px;
          height: 100vh;
          max-width: 100vw;
          background: var(--bg);
          color: var(--text);
          overflow: hidden;
          position: relative;
        }
        .screen-container {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}
