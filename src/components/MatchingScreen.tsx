import { useEffect, useState } from 'react';
import type { Character, Scenario } from '../types';
import { CHARACTERS } from '../config/characters';

interface MatchingScreenProps {
  character: Character;
  scenario?: Scenario | null;
}

export function MatchingScreen({ character, scenario }: MatchingScreenProps) {
  const [phase, setPhase] = useState<'spinning' | 'revealed'>('spinning');
  const [displayIdx, setDisplayIdx] = useState(0);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let speed = 80;
    let timer: ReturnType<typeof setTimeout>;
    const spin = () => {
      setDisplayIdx((prev) => (prev + 1) % CHARACTERS.length);
      speed += 15;
      if (speed < 400) {
        timer = setTimeout(spin, speed);
      } else {
        setPhase('revealed');
      }
    };
    timer = setTimeout(spin, speed);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== 'revealed') return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 700);
    return () => clearInterval(timer);
  }, [phase]);

  const displayChar = phase === 'spinning' ? CHARACTERS[displayIdx] : character;

  return (
    <div className="matching">
      <div className="matching-label">오늘의 종목은...</div>

      <div className="matching-slot">
        <div className="matching-frame pixel-panel">
          <div className={`matching-emoji ${phase === 'spinning' ? 'spinning' : 'bounce'}`}>
            {displayChar.emoji}
          </div>
        </div>

        {phase === 'revealed' && (
          <div className="matching-info">
            <div className="matching-name">{displayChar.name}</div>
            {scenario && (
              <div className="matching-scenario pixel-panel">
                <div className="matching-scenario-title">[{scenario.nameKo}]</div>
                <div className="matching-scenario-desc">{scenario.description}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {phase === 'revealed' && (
        <div className={`matching-countdown ${countdown === 0 ? 'matching-go' : ''}`}>
          {countdown > 0 ? `${countdown}...` : 'START!'}
        </div>
      )}

      <style>{`
        .matching {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 28px;
          padding: 24px;
        }
        .matching-label {
          font-size: 14px;
          color: var(--text-sub);
          animation: blink 1.5s infinite;
        }
        .matching-slot {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .matching-frame {
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }
        .matching-emoji {
          font-size: 64px;
          line-height: 1;
        }
        .spinning {
          filter: blur(1px);
        }
        .bounce {
          filter: none;
          animation: matchReveal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes matchReveal {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .matching-info {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: fadeSlideIn 0.3s ease-out;
        }
        .matching-name {
          font-size: 16px;
          color: var(--text);
        }
        .matching-scenario {
          padding: 10px 16px;
        }
        .matching-scenario-title {
          font-size: 13px;
          color: var(--accent);
          font-weight: bold;
        }
        .matching-scenario-desc {
          font-size: 11px;
          color: var(--text-sub);
          margin-top: 4px;
        }
        .matching-countdown {
          font-family: var(--font-en);
          font-size: 22px;
          color: var(--text);
          animation: pulseGlow 0.7s ease-in-out infinite;
        }
        .matching-go {
          font-size: 28px;
          color: var(--green);
          animation: matchReveal 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
