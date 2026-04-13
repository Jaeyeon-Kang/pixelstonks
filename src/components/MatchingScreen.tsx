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

  // 슬롯 돌리기 (점점 느려지는 효과)
  useEffect(() => {
    let speed = 80;
    let timer: ReturnType<typeof setTimeout>;

    const spin = () => {
      setDisplayIdx((prev) => (prev + 1) % CHARACTERS.length);
      speed += 15; // 점점 느려짐
      if (speed < 400) {
        timer = setTimeout(spin, speed);
      } else {
        setPhase('revealed');
      }
    };
    timer = setTimeout(spin, speed);

    return () => clearTimeout(timer);
  }, []);

  // 확정 후 카운트다운
  useEffect(() => {
    if (phase !== 'revealed') return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 500);
    return () => clearInterval(timer);
  }, [phase]);

  const displayChar = phase === 'spinning' ? CHARACTERS[displayIdx] : character;
  const isRare = character.id === 'panic';

  return (
    <div className="matching">
      <div className="matching-label">오늘의 종목은...</div>

      <div className={`matching-slot ${phase === 'revealed' ? 'matching-slot-revealed' : ''}`}>
        {/* 슬롯 프레임 */}
        <div className="matching-frame">
          <div className={`matching-emoji ${phase === 'spinning' ? 'matching-spinning' : 'matching-bounce'}`}>
            {displayChar.emoji}
          </div>
        </div>

        {phase === 'revealed' && (
          <div className="matching-info">
            <div className="matching-name">{displayChar.name}</div>
            {isRare && <div className="matching-rare">★ RARE ★</div>}
            {scenario && (
              <div className="matching-scenario">
                📰 {scenario.nameKo}
                <div className="matching-scenario-desc">{scenario.description}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {phase === 'revealed' && (
        <div className="matching-countdown">
          {countdown > 0 ? `${countdown}...` : 'GO!'}
        </div>
      )}

      <style>{`
        .matching {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 32px;
          padding: 24px;
        }
        .matching-label {
          font-family: var(--font-pixel);
          font-size: 12px;
          color: var(--gb-lightest);
          animation: blink 1.5s infinite;
        }
        .matching-slot {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .matching-frame {
          width: 160px;
          height: 160px;
          border: 3px solid var(--gb-light);
          border-bottom-color: var(--surface);
          border-right-color: var(--surface);
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            inset 0 0 20px rgba(0,0,0,0.3),
            0 0 20px rgba(168, 194, 86, 0.08);
          position: relative;
          overflow: hidden;
          border-radius: 4px;
        }
        .matching-emoji {
          font-size: 72px;
          line-height: 1;
        }
        .matching-spinning {
          animation: none;
          filter: blur(1px);
        }
        .matching-bounce {
          filter: none;
          animation: matchReveal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes matchReveal {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .matching-slot-revealed .matching-frame {
          border-color: var(--gb-lightest);
          box-shadow:
            inset 0 0 15px rgba(0,0,0,0.2),
            0 0 20px rgba(168, 194, 86, 0.15);
        }
        .matching-info {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 6px;
          animation: fadeSlideIn 0.3s ease-out;
        }
        .matching-name {
          font-family: var(--font-pixel);
          font-size: 14px;
          color: var(--gb-lightest);
        }
        .matching-rare {
          font-family: var(--font-pixel);
          font-size: 10px;
          color: var(--accent);
          animation: blink 0.6s infinite;
          text-shadow: 0 0 8px var(--accent);
        }
        .matching-scenario {
          font-family: var(--font-pixel);
          font-size: 10px;
          color: var(--gb-light);
          margin-top: 8px;
          padding: 8px 12px;
          background: var(--surface);
          border: 1px solid var(--gb-dark);
          border-radius: 4px;
          animation: fadeSlideIn 0.4s ease-out 0.2s both;
        }
        .matching-scenario-desc {
          font-size: 7px;
          color: var(--muted);
          margin-top: 6px;
          line-height: 1.6;
        }
        .matching-countdown {
          font-family: var(--font-pixel);
          font-size: 24px;
          color: var(--gb-lightest);
          text-shadow: 0 0 12px var(--gb-light);
          animation: pulseGlow 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
