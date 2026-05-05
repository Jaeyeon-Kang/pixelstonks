import { useEffect, useState } from 'react';
import type { Character, GameMode } from '../types';
import { CHARACTERS } from '../config/characters';
import { sound } from '../utils/sound';

interface MatchingScreenProps {
  character: Character;
  mode?: GameMode;
}

const MODE_BADGE: Record<GameMode, string | null> = {
  normal: null,
  challenge: '★ 오늘의 챌린지',
  tutorial: '튜토리얼 · V자 반등 강제',
};

export function MatchingScreen({ character, mode = 'normal' }: MatchingScreenProps) {
  const [phase, setPhase] = useState<'spinning' | 'revealed'>('spinning');
  const [displayIdx, setDisplayIdx] = useState(0);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let speed = 80;
    let timer: ReturnType<typeof setTimeout>;
    const spin = () => {
      setDisplayIdx((prev) => (prev + 1) % CHARACTERS.length);
      sound.play('tick');
      speed += 15;
      if (speed < 400) {
        timer = setTimeout(spin, speed);
      } else {
        sound.play('reveal');
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
        sound.play('countdown');
        return prev - 1;
      });
    }, 700);
    return () => clearInterval(timer);
  }, [phase]);

  const displayChar = phase === 'spinning' ? CHARACTERS[displayIdx] : character;

  const badge = MODE_BADGE[mode];

  return (
    <div className="matching">
      {badge && <div className={`matching-badge mb-${mode}`}>{badge}</div>}
      <div className="matching-label">오늘의 종목은...</div>

      <div className="matching-slot">
        <div className="matching-frame pixel-panel">
          <div className={`matching-sprite ${phase === 'spinning' ? 'spinning' : 'bounce'}`}>
            <img src={displayChar.sprite} alt={displayChar.name} className="sprite-img" draggable={false} />
          </div>
        </div>

        {phase === 'revealed' && (
          <div className="matching-info">
            <div className="matching-name">{displayChar.name}</div>
            <div className="matching-tagline">차트는 직접 읽어라</div>
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
        .matching-badge {
          font-size: 11px;
          padding: 6px 12px;
          border-radius: 4px;
          letter-spacing: 1px;
          margin-bottom: -10px;
        }
        .matching-badge.mb-challenge {
          color: var(--gold);
          background: rgba(243,156,18,0.1);
          border: 1px solid var(--gold);
        }
        .matching-badge.mb-tutorial {
          color: var(--accent);
          background: rgba(230,126,34,0.1);
          border: 1px dashed var(--accent);
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
        .matching-sprite {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .matching-sprite .sprite-img {
          width: 100%;
          height: 100%;
          image-rendering: pixelated;
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
        .matching-tagline {
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 1px;
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
