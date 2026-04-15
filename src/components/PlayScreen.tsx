import { useEffect, useRef, useState } from 'react';
import type { GameState, ScenarioEvent } from '../types';
import { renderChart } from '../engine/chartRenderer';
import { GAME_CONFIG } from '../config/gameConfig';

interface PlayScreenProps {
  state: GameState;
  onTrade: (action: 'BUY' | 'SELL' | 'HOLD') => void;
}

export function PlayScreen({ state, onTrade }: PlayScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visibleEvent, setVisibleEvent] = useState<ScenarioEvent | null>(null);
  const [eventKey, setEventKey] = useState(0);
  const [showHint, setShowHint] = useState(() => {
    const played = localStorage.getItem('pixel-stonks-stats');
    if (!played) return true;
    try { return JSON.parse(played).totalGames === 0; } catch { return true; }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderChart(ctx, state.candles, {
      width: canvas.width,
      height: canvas.height,
      entryPrice: state.entryPrice,
    });
  }, [state.candles, state.entryPrice]);

  useEffect(() => {
    if (!showHint) return;
    const t = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(t);
  }, [showHint]);

  useEffect(() => {
    if (!state.currentEvent) return;
    setVisibleEvent(state.currentEvent);
    setEventKey((k) => k + 1);
    const timer = setTimeout(() => setVisibleEvent(null), 3000);
    return () => clearTimeout(timer);
  }, [state.currentEvent]);

  const canBuy = state.position === 'NONE' && state.tradesLeft > 0;
  const canSell = state.position === 'HOLDING';
  const profitSign = state.profitRate >= 0 ? '+' : '';
  const isUrgent = state.timeLeft <= 5;

  // 잔액 계산
  const seed = GAME_CONFIG.initialPrice;
  const currentBalance = state.position === 'HOLDING' && state.entryPrice
    ? seed + (state.currentPrice - state.entryPrice)
    : seed + (seed * state.profitRate / 100);
  const pnl = Math.round(currentBalance - seed);
  const pnlSign = pnl >= 0 ? '+' : '';

  return (
    <div className={`play ${isUrgent ? 'play-urgent' : ''}`}>
      {/* 상단: 캐릭터 + 매매권 */}
      <div className="play-top">
        <div className="play-char">
          <span className="play-char-emoji">{state.character?.emoji}</span>
          <span className="play-char-name">{state.character?.name}</span>
        </div>
        <div className="play-trades">
          <span className="play-trades-label">{state.tradesLeft}</span>
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i} className={`dot ${i < state.tradesLeft ? 'on' : 'off'}`} />
          ))}
        </div>
      </div>

      {/* 잔액 + 손익 */}
      <div className="play-balance">
        <div className="play-balance-amount">
          {Math.round(currentBalance).toLocaleString()}P
        </div>
        <div className={`play-balance-pnl ${pnl >= 0 ? 'profit-positive' : 'profit-negative'}`}>
          {pnlSign}{pnl.toLocaleString()}P ({profitSign}{state.profitRate.toFixed(1)}%)
          {state.position === 'NONE' && state.entryPrice !== null && ' 확정'}
        </div>
      </div>

      {/* 이벤트 배너 */}
      {visibleEvent && (
        <div key={eventKey} className={`play-event ev-${visibleEvent.type}`}>
          {visibleEvent.headline}
        </div>
      )}

      {/* 차트 */}
      <div className="play-chart pixel-panel">
        <canvas ref={canvasRef} width={360} height={260} className="play-canvas" />
      </div>

      {/* 타이머 */}
      <div className="play-timer-row">
        <span className="play-speed-badge">x60 압축</span>
        <span className={`timer-text ${isUrgent ? 'timer-urgent' : ''}`}>
          00:{String(state.timeLeft).padStart(2, '0')}
        </span>
        <span className="play-speed-label">30분 → 30초</span>
      </div>

      {/* 첫 판 힌트 */}
      {showHint && (
        <div className="play-hint" onClick={() => setShowHint(false)}>
          차트를 보고 매수/매도 타이밍을 잡으세요! 매매 기회 3회
        </div>
      )}

      {/* 버튼 */}
      <div className="play-btns">
        <button className="btn-retro btn-buy play-btn" disabled={!canBuy} onClick={() => onTrade('BUY')}>
          ▲ 매수
        </button>
        <button className="btn-retro btn-sell play-btn" disabled={!canSell} onClick={() => onTrade('SELL')}>
          ▼ 매도
        </button>
        <button className="btn-retro btn-hold play-btn" disabled={state.tradesLeft <= 0} onClick={() => onTrade('HOLD')}>
          ■ 관망
        </button>
      </div>

      <style>{`
        .play {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 10px 14px 18px;
          gap: 6px;
        }
        .play-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2px 0;
        }
        .play-char {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .play-char-emoji { font-size: 20px; }
        .play-char-name {
          font-size: 12px;
          color: var(--text);
        }
        .play-trades {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .play-trades-label {
          font-family: var(--font-en);
          font-size: 9px;
          color: var(--text-sub);
          margin-right: 2px;
        }
        .dot {
          width: 8px; height: 8px;
          border-radius: 2px;
        }
        .dot.on {
          background: var(--gold);
          box-shadow: 0 0 4px rgba(243,156,18,0.4);
        }
        .dot.off {
          background: var(--border);
        }

        .play-balance {
          text-align: center;
          padding: 4px 0 2px;
        }
        .play-balance-amount {
          font-family: var(--font-en);
          font-size: 20px;
          color: var(--text);
          font-weight: bold;
        }
        .play-balance-pnl {
          font-family: var(--font-en);
          font-size: 11px;
          margin-top: 2px;
        }

        .play-event {
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 11px;
          color: var(--text);
          border-left: 3px solid var(--muted);
          background: var(--surface);
          animation: fadeSlideIn 0.3s ease-out;
        }
        .ev-bullish { border-left-color: var(--profit); background: rgba(214,48,49,0.06); }
        .ev-bearish { border-left-color: var(--loss); background: rgba(26,107,206,0.06); }
        .ev-shock { border-left-color: var(--accent); background: rgba(230,126,34,0.06); }

        .play-chart {
          flex: 1 1 auto;
          min-height: 180px;
          overflow: hidden;
          background: #faf8f4;
        }
        .play-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        .play-timer-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .play-speed-badge {
          font-family: var(--font-en);
          font-size: 7px;
          color: var(--accent);
          border: 1px solid var(--accent);
          padding: 2px 5px;
          border-radius: 3px;
          letter-spacing: 0.5px;
        }
        .play-speed-label {
          font-size: 9px;
          color: var(--muted);
        }

        .play-hint {
          text-align: center;
          font-size: 11px;
          color: var(--accent);
          background: rgba(230,126,34,0.08);
          border: 1px dashed var(--accent);
          border-radius: 4px;
          padding: 6px 10px;
          animation: fadeSlideIn 0.3s ease-out;
          cursor: pointer;
        }

        .play-btns {
          display: flex;
          gap: 6px;
          margin-top: auto;
          padding-top: 4px;
        }
        .play-btn {
          flex: 1;
          height: 48px;
          font-family: var(--font-en);
          font-size: 12px;
          border-radius: 4px;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: #fff;
          transition: opacity 0.15s;
        }
        .play-btn:disabled {
          opacity: 0.25;
          filter: grayscale(0.8);
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        /* 5초 남았을 때 긴장감 */
        .play-urgent {
          animation: urgentPulse 0.5s ease-in-out infinite;
        }
        @keyframes urgentPulse {
          0%, 100% { box-shadow: inset 0 0 0 0 transparent; }
          50% { box-shadow: inset 0 0 20px rgba(214,48,49,0.15); }
        }
        .play-urgent .timer-text {
          font-size: 28px;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
