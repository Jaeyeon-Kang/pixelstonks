import { useState, useEffect, useCallback } from 'react';
import { useGameLoop } from './game/useGameLoop';
import { HomeScreen } from './components/HomeScreen';
import { MatchingScreen } from './components/MatchingScreen';
import { PlayScreen } from './components/PlayScreen';
import { ResultScreen } from './components/ResultScreen';
import { RankingScreen } from './components/RankingScreen';
import { NicknameModal } from './components/NicknameModal';
import { loadNickname } from './utils/nickname';
import { dailyKey } from './utils/rng';
import type { GameMode } from './types';

const TUTORIAL_KEY = 'pixel-stonks-tutorial-done';
const CHALLENGE_KEY = 'pixel-stonks-challenge-played';

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

function isChallengePlayedToday(): boolean {
  try {
    return localStorage.getItem(CHALLENGE_KEY) === dailyKey();
  } catch {
    return false;
  }
}

function markChallengePlayed() {
  try {
    localStorage.setItem(CHALLENGE_KEY, dailyKey());
  } catch { /* ignore */ }
}

function isTutorialDone(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_KEY) === '1';
  } catch {
    return false;
  }
}

function markTutorialDone() {
  try {
    localStorage.setItem(TUTORIAL_KEY, '1');
  } catch { /* ignore */ }
}

export default function App() {
  const { state, startGame, executeTrade, previewNext, goHome } = useGameLoop();
  const [stats, setStats] = useState(loadStats);
  const [showRanking, setShowRanking] = useState(false);
  const [showNickModal, setShowNickModal] = useState(false);
  const [nickname, setNickname] = useState<string | null>(loadNickname);
  const [pendingMode, setPendingMode] = useState<GameMode>('normal');
  const [challengePlayedToday, setChallengePlayedToday] = useState(isChallengePlayedToday);

  const openRanking = useCallback(() => setShowRanking(true), []);
  const closeRanking = useCallback(() => setShowRanking(false), []);

  const launch = useCallback((mode: GameMode) => {
    if (mode === 'challenge') {
      if (isChallengePlayedToday()) return;
      markChallengePlayed();
      setChallengePlayedToday(true);
    }
    if (mode === 'tutorial') {
      markTutorialDone();
    }
    if (!nickname) {
      setPendingMode(mode);
      setShowNickModal(true);
    } else {
      startGame(mode);
    }
  }, [nickname, startGame]);

  const handleStart = useCallback(() => launch('normal'), [launch]);
  const handleChallenge = useCallback(() => launch('challenge'), [launch]);
  const handleTutorial = useCallback(() => launch('tutorial'), [launch]);

  // 첫 실행: 닉네임 모달 → 확인 후 튜토리얼 자동 진입
  const [bootChecked, setBootChecked] = useState(false);
  useEffect(() => {
    if (bootChecked) return;
    setBootChecked(true);
    if (!isTutorialDone() && stats.totalGames === 0 && state.phase === 'HOME') {
      // 닉네임 없으면 닉 입력 후 튜토리얼, 있으면 바로
      if (!nickname) {
        setPendingMode('tutorial');
        setShowNickModal(true);
      } else {
        markTutorialDone();
        startGame('tutorial');
      }
    }
  }, [bootChecked, stats.totalGames, state.phase, nickname, startGame]);

  const handleNicknameConfirm = useCallback((nick: string) => {
    setNickname(nick);
    setShowNickModal(false);
    if (pendingMode === 'tutorial') markTutorialDone();
    if (pendingMode === 'challenge') {
      markChallengePlayed();
      setChallengePlayedToday(true);
    }
    startGame(pendingMode);
  }, [startGame, pendingMode]);

  const [nickEditMode, setNickEditMode] = useState(false);
  const handleChangeNick = useCallback(() => setNickEditMode(true), []);
  const handleNickEditConfirm = useCallback((nick: string) => {
    setNickname(nick);
    setNickEditMode(false);
  }, []);

  // 결과 → stats 갱신 (튜토리얼은 통계에서 제외)
  useEffect(() => {
    if (state.phase === 'RESULT' && state.finalProfitRate !== null && state.mode !== 'tutorial') {
      setStats((prev) => {
        const newBest = prev.bestScore === null
          ? state.finalProfitRate!
          : Math.max(prev.bestScore, state.finalProfitRate!);
        const newTotal = prev.totalGames + 1;
        saveStats(newBest, newTotal);
        return { bestScore: newBest, totalGames: newTotal };
      });
    }
  }, [state.phase, state.finalProfitRate, state.mode]);

  const screenKey = showRanking ? 'RANKING' : state.phase;
  const tutorialDone = isTutorialDone();

  return (
    <div className="app-root">
      <div className="game-frame">
        <div className="scanlines" />
        <div className="vignette" />

        <div className="screen-container screen-enter" key={screenKey}>
          {showRanking ? (
            <RankingScreen onBack={closeRanking} />
          ) : (
            <>
              {state.phase === 'HOME' && (
                <HomeScreen
                  onStart={handleStart}
                  onChallenge={handleChallenge}
                  onTutorial={handleTutorial}
                  onRanking={openRanking}
                  bestScore={stats.bestScore}
                  totalGames={stats.totalGames}
                  nickname={nickname}
                  onChangeNick={handleChangeNick}
                  challengePlayedToday={challengePlayedToday}
                  tutorialDone={tutorialDone}
                />
              )}
              {state.phase === 'MATCHING' && state.character && (
                <MatchingScreen character={state.character} mode={state.mode} />
              )}
              {state.phase === 'PLAYING' && (
                <PlayScreen state={state} onTrade={executeTrade} onPreview={previewNext} />
              )}
              {state.phase === 'RESULT' && (
                <ResultScreen
                  state={state}
                  onRestart={() => launch(state.mode === 'tutorial' ? 'normal' : state.mode)}
                  onHome={goHome}
                  onRanking={openRanking}
                />
              )}
            </>
          )}
        </div>

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
