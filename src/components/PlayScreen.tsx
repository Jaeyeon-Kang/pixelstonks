import { useEffect, useRef, useState } from 'react';
import type { GameState, ScenarioEvent } from '../types';
import { renderChart } from '../engine/chartRenderer';

interface PlayScreenProps {
  state: GameState;
  onTrade: (action: 'BUY' | 'SELL' | 'HOLD') => void;
}

/** 이벤트 배너 색상 */
const EVENT_COLORS: Record<ScenarioEvent['type'], string> = {
  info: '#5a6078',
  bullish: '#3d7ec7',
  bearish: '#c75050',
  shock: '#ffcf40',
};

export function PlayScreen({ state, onTrade }: PlayScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visibleEvent, setVisibleEvent] = useState<ScenarioEvent | null>(null);
  const [eventKey, setEventKey] = useState(0);

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

  // 이벤트 배너 표시 (3초 후 자동 소멸)
  useEffect(() => {
    if (!state.currentEvent) return;
    setVisibleEvent(state.currentEvent);
    setEventKey((k) => k + 1);

    const timer = setTimeout(() => setVisibleEvent(null), 3000);
    return () => clearTimeout(timer);
  }, [state.currentEvent]);

  const canBuy = state.position === 'NONE' && state.tradesLeft > 0;
  const canSell = state.position === 'HOLDING' && state.tradesLeft > 0;
  const profitSign = state.profitRate >= 0 ? '+' : '';
  const profitClass = state.profitRate >= 0 ? 'profit-positive' : 'profit-negative';
  const isUrgent = state.timeLeft <= 5;

  const profitAmount = state.entryPrice
    ? Math.round(state.currentPrice - state.entryPrice)
    : 0;

  return (
    <div className="play">
      {/* 상단 바 */}
      <div className="play-topbar">
        <div className="play-char">
          <span className="play-char-emoji">{state.character?.emoji}</span>
          <span className="play-char-name">{state.character?.name}</span>
        </div>
        <div className="play-trades">
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className={`play-trade-dot ${i < state.tradesLeft ? 'play-trade-active' : 'play-trade-used'}`}
            >
              ⚡
            </span>
          ))}
        </div>
      </div>

      {/* 시드 + 손익 */}
      <div className="play-info">
        <div className="play-seed">
          {Math.round(state.currentPrice).toLocaleString()}P
        </div>
        {state.position === 'HOLDING' && (
          <div className={`play-profit ${profitClass}`}>
            {profitSign}{profitAmount.toLocaleString()}P ({profitSign}{state.profitRate.toFixed(1)}%)
          </div>
        )}
        {state.position === 'NONE' && state.entryPrice !== null && (
          <div className={`play-profit ${profitClass}`}>
            확정 {profitSign}{state.profitRate.toFixed(1)}%
          </div>
        )}
      </div>

      {/* 이벤트 뉴스 배너 */}
      {visibleEvent && (
        <div
          key={eventKey}
          className={`play-event play-event-${visibleEvent.type}`}
          style={{
            borderLeftColor: EVENT_COLORS[visibleEvent.type],
            '--event-glow': EVENT_COLORS[visibleEvent.type],
          } as React.CSSProperties}
        >
          <span className="play-event-text">{visibleEvent.headline}</span>
        </div>
      )}

      {/* 캔들 차트 */}
      <div className="play-chart-wrap">
        <canvas
          ref={canvasRef}
          width={360}
          height={260}
          className="play-canvas"
        />
      </div>

      {/* 타이머 */}
      <div className={`timer-text ${isUrgent ? 'timer-urgent' : ''}`}>
        00:{String(state.timeLeft).padStart(2, '0')}
      </div>

      {/* 매매 버튼 */}
      <div className="play-buttons">
        <button
          className={`btn-retro btn-pixel btn-buy play-btn`}
          disabled={!canBuy}
          onClick={() => onTrade('BUY')}
        >
          BUY
          <span className="play-btn-icon">📈</span>
        </button>
        <button
          className={`btn-retro btn-pixel btn-sell play-btn`}
          disabled={!canSell}
          onClick={() => onTrade('SELL')}
        >
          SELL
          <span className="play-btn-icon">📉</span>
        </button>
        <button
          className={`btn-retro btn-pixel btn-hold play-btn`}
          onClick={() => onTrade('HOLD')}
        >
          HOLD
          <span className="play-btn-icon">⏸</span>
        </button>
      </div>

      <style>{`
        .play {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 10px 12px 20px;
          gap: 8px;
        }
        .play-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
        }
        .play-char {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .play-char-emoji {
          font-size: 22px;
        }
        .play-char-name {
          font-family: var(--font-pixel);
          font-size: 9px;
          color: var(--gb-lightest);
        }
        .play-trades {
          display: flex;
          gap: 4px;
        }
        .play-trade-dot {
          font-size: 16px;
          transition: opacity 0.3s;
        }
        .play-trade-active {
          opacity: 1;
          filter: drop-shadow(0 0 4px rgba(255,215,0,0.6));
        }
        .play-trade-used {
          opacity: 0.2;
          filter: grayscale(1);
        }
        .play-info {
          text-align: center;
          padding: 4px 0;
        }
        .play-seed {
          font-family: var(--font-pixel);
          font-size: 13px;
          color: var(--gb-lightest);
        }
        .play-profit {
          font-family: var(--font-pixel);
          font-size: 11px;
          margin-top: 2px;
        }

        /* === 이벤트 뉴스 배너 === */
        .play-event {
          background: var(--surface);
          border-left: 3px solid var(--accent);
          padding: 6px 10px;
          border-radius: 3px;
          animation: eventSlideIn 0.3s ease-out, eventFadeOut 0.6s 2.4s forwards;
          box-shadow:
            0 2px 8px rgba(0,0,0,0.3),
            inset 0 0 12px rgba(0,0,0,0.15),
            0 0 8px color-mix(in srgb, var(--event-glow, var(--accent)) 20%, transparent);
        }
        .play-event-text {
          font-family: var(--font-pixel);
          font-size: 7px;
          color: var(--gb-lightest);
          line-height: 1.8;
          display: block;
        }
        .play-event-shock {
          background: linear-gradient(90deg, rgba(255,207,64,0.12), var(--surface));
        }
        .play-event-bullish {
          background: linear-gradient(90deg, rgba(91,181,245,0.12), var(--surface));
        }
        .play-event-bearish {
          background: linear-gradient(90deg, rgba(240,104,104,0.12), var(--surface));
        }
        @keyframes eventSlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes eventFadeOut {
          from { opacity: 1; }
          to { opacity: 0; transform: translateY(-4px); }
        }

        .play-chart-wrap {
          flex: 1 1 auto;
          min-height: 200px;
          border: 2px solid var(--surface);
          border-radius: 4px;
          overflow: hidden;
          background: var(--gb-darkest);
          box-shadow: inset 0 0 8px rgba(0,0,0,0.3);
        }
        .play-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
        .play-buttons {
          display: flex;
          gap: 6px;
          padding-top: 4px;
          margin-top: auto;
        }
        .play-btn {
          flex: 1;
          height: 52px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          font-size: 11px;
          padding: 4px;
        }
        .play-btn-icon {
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
