import { useState } from 'react';
import { sound } from '../utils/sound';

interface HomeScreenProps {
  onStart: () => void;
  onChallenge: () => void;
  onTutorial: () => void;
  onRanking: () => void;
  bestScore: number | null;
  totalGames: number;
  nickname: string | null;
  onChangeNick: () => void;
  challengePlayedToday: boolean;
  tutorialDone: boolean;
}

export function HomeScreen({
  onStart,
  onChallenge,
  onTutorial,
  onRanking,
  bestScore,
  totalGames,
  nickname,
  onChangeNick,
  challengePlayedToday,
  tutorialDone,
}: HomeScreenProps) {
  const [muted, setMuted] = useState(() => sound.isMuted());

  const toggleMute = () => {
    const next = !muted;
    sound.setMuted(next);
    setMuted(next);
    if (!next) sound.play('click');
  };

  const wrap = (fn: () => void) => () => {
    sound.play('click');
    fn();
  };

  const handleStart = wrap(onStart);
  const handleRanking = wrap(onRanking);
  const handleChallenge = challengePlayedToday ? undefined : wrap(onChallenge);
  const handleTutorial = wrap(onTutorial);

  return (
    <div className="home">
      <button
        className="home-mute"
        onClick={toggleMute}
        aria-label={muted ? '사운드 켜기' : '사운드 끄기'}
      >
        {muted ? 'OFF' : 'ON'}
      </button>
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

        <button className="btn-retro btn-pixel home-start" onClick={handleStart}>
          {'>'} 시작하기
        </button>

        <button
          className={`btn-retro home-challenge ${challengePlayedToday ? 'is-done' : ''}`}
          onClick={handleChallenge}
          disabled={challengePlayedToday}
        >
          <span className="ch-icon">★</span>
          <span className="ch-main">오늘의 챌린지</span>
          <span className="ch-sub">{challengePlayedToday ? '내일 다시 도전' : '하루 1번 · 모두 같은 차트'}</span>
        </button>

        <div className="home-actions-row">
          <button className="btn-retro btn-sub home-action" onClick={handleRanking}>
            랭킹
          </button>
          {!tutorialDone && (
            <button className="btn-retro btn-sub home-action home-action-tut" onClick={handleTutorial}>
              튜토리얼
            </button>
          )}
        </div>

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
        <div className="home-hint">30초 · 매수 3회 · 엿보기 1슬롯</div>
      </div>

      <style>{`
        .home { height: 100%; position: relative; }
        .home-mute {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 5;
          font-family: var(--font-en);
          font-size: 9px;
          letter-spacing: 1px;
          padding: 6px 10px;
          background: var(--surface);
          color: var(--text-sub);
          border: 1px solid var(--border);
          border-radius: 4px;
          cursor: pointer;
        }
        .home-mute:active { transform: translateY(1px); }
        .home-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 36px 24px;
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
          height: 50px;
          font-size: 15px;
          letter-spacing: 3px;
          margin-top: 4px;
        }
        .home-challenge {
          width: 240px;
          padding: 8px 14px;
          background: linear-gradient(135deg, rgba(243,156,18,0.12) 0%, rgba(230,126,34,0.06) 100%);
          border: 2px solid var(--gold);
          border-bottom-color: #c47e1a;
          border-right-color: #c47e1a;
          box-shadow: 0 3px 0 #a36716;
          border-radius: 4px;
          color: var(--text);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .home-challenge:active { box-shadow: 0 1px 0 #a36716; }
        .home-challenge.is-done {
          opacity: 0.45;
          background: var(--bg-deep);
          border-color: var(--border);
          box-shadow: none;
        }
        .ch-icon {
          font-size: 14px;
          color: var(--gold);
        }
        .ch-main {
          font-size: 12px;
          letter-spacing: 1px;
          font-weight: bold;
        }
        .ch-sub {
          font-size: 9px;
          color: var(--text-sub);
          letter-spacing: 0.5px;
        }
        .home-actions-row {
          display: flex;
          gap: 8px;
        }
        .home-action {
          height: 36px;
          padding: 0 18px;
          font-size: 11px;
          letter-spacing: 2px;
          border-radius: 4px;
        }
        .home-action-tut {
          color: var(--accent);
          border-color: var(--accent);
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
          bottom: 22px;
        }
      `}</style>
    </div>
  );
}
