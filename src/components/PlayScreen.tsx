import { useEffect, useMemo, useRef, useState } from 'react';
import type { Candle, GameState, ScenarioEvent } from '../types';
import { renderChart } from '../engine/chartRenderer';
import { GAME_CONFIG } from '../config/gameConfig';
import { sound, vibrate } from '../utils/sound';

interface PlayScreenProps {
  state: GameState;
  onTrade: (action: 'BUY' | 'SELL') => void;
  onPreview: () => Candle[];
}

// 튜토리얼: V자 반등 (TREND_DOWN 0-14, SHOCK_UP 15-16, TREND_UP 17-29) 기준 가이드
function tutorialStep(tick: number, position: 'NONE' | 'HOLDING'): string {
  if (tick < 0) return '시작 직후 차트가 떨어지기 시작해요';
  if (tick <= 6) return '⬇ 급락 중. 떨어지는 칼은 잡지 마세요';
  if (tick <= 13) return '⚠ 공포 최고조. 조금만 더 기다려보세요';
  if (tick <= 16) {
    if (position === 'NONE') return '★ 지금! 정부 개입 발표 → 매수 버튼';
    return '✓ 매수 성공! 이제 보유';
  }
  if (tick <= 24) {
    if (position === 'HOLDING') return '↑ 반등 중. 좀 더 기다려보세요';
    return '아쉽네요... 매수 타이밍을 놓쳤어요';
  }
  if (position === 'HOLDING') return '★ 고점 근처! 매도 버튼으로 차익 실현';
  return '거의 끝났어요';
}

export function PlayScreen({ state, onTrade, onPreview }: PlayScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visibleEvent, setVisibleEvent] = useState<ScenarioEvent | null>(null);
  const [eventKey, setEventKey] = useState(0);
  const [ghostCandles, setGhostCandles] = useState<Candle[]>([]);
  const [showHint, setShowHint] = useState(() => {
    const played = localStorage.getItem('pixel-stonks-stats');
    if (!played) return true;
    try { return JSON.parse(played).totalGames === 0; } catch { return true; }
  });

  // Y축 확장 윈도우: 새 극값이 나오면 늘리되 절대 줄어들지 않음 (고스트 포함)
  const yRangeRef = useRef<{ min: number; max: number } | null>(null);
  const yRange = useMemo(() => {
    if (state.candles.length === 0) {
      yRangeRef.current = null;
      return null;
    }
    let candleMin = Infinity;
    let candleMax = -Infinity;
    for (const c of state.candles) {
      if (c.low < candleMin) candleMin = c.low;
      if (c.high > candleMax) candleMax = c.high;
    }
    for (const g of ghostCandles) {
      if (g.low < candleMin) candleMin = g.low;
      if (g.high > candleMax) candleMax = g.high;
    }
    if (state.entryPrice !== null) {
      if (state.entryPrice < candleMin) candleMin = state.entryPrice;
      if (state.entryPrice > candleMax) candleMax = state.entryPrice;
    }
    if (!yRangeRef.current) {
      const span = candleMax - candleMin || candleMax * 0.04;
      const pad = span * 0.18;
      yRangeRef.current = { min: candleMin - pad, max: candleMax + pad };
    } else {
      const next = { ...yRangeRef.current };
      if (candleMin < next.min) next.min = candleMin - (candleMax - candleMin) * 0.05;
      if (candleMax > next.max) next.max = candleMax + (candleMax - candleMin) * 0.05;
      yRangeRef.current = next;
    }
    return yRangeRef.current;
  }, [state.candles, state.entryPrice, ghostCandles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderChart(ctx, state.candles, {
      width: canvas.width,
      height: canvas.height,
      entryPrice: state.entryPrice,
      yMin: yRange?.min,
      yMax: yRange?.max,
      ghostCandles,
    });
  }, [state.candles, state.entryPrice, yRange, ghostCandles]);

  // 미리보기 고스트는 3초 후 자동 사라짐
  // 실제 캔들과 겹치는 부분은 chartRenderer가 자연스럽게 가림
  useEffect(() => {
    if (ghostCandles.length === 0) return;
    const t = setTimeout(() => setGhostCandles([]), 3000);
    return () => clearTimeout(t);
  }, [ghostCandles]);

  // 틱 사운드: 일반 틱은 매우 작게, 마지막 3초는 카운트다운 비프
  useEffect(() => {
    if (state.currentTick < 0) return;
    if (state.timeLeft > 0 && state.timeLeft <= 3) {
      sound.play('countdown');
    } else if (state.currentTick > 0) {
      sound.play('tick');
    }
  }, [state.currentTick, state.timeLeft]);

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
          <img src={state.character?.sprite} alt={state.character?.name} className="play-char-sprite" draggable={false} />
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
      {showHint && state.mode !== 'tutorial' && (
        <div className="play-hint" onClick={() => setShowHint(false)}>
          매수·매도로 차트 타이밍 잡기. 엿보기는 다음 3틱 미리 (1슬롯 소모)
        </div>
      )}

      {/* 튜토리얼 가이드 (V자 반등 scenario id=5 기준) */}
      {state.mode === 'tutorial' && (
        <div className="play-tutorial">
          {tutorialStep(state.currentTick, state.position)}
        </div>
      )}

      {/* 버튼 */}
      <div className="play-btns">
        <button
          className="btn-retro btn-buy play-btn"
          disabled={!canBuy}
          onClick={() => { sound.play('buy'); vibrate(25); onTrade('BUY'); }}
        >
          ▲ 매수
        </button>
        <button
          className="btn-retro btn-sell play-btn"
          disabled={!canSell}
          onClick={() => { sound.play('sell'); vibrate(25); onTrade('SELL'); }}
        >
          ▼ 매도
        </button>
        <button
          className="btn-retro btn-hold play-btn"
          disabled={state.tradesLeft <= 0 || ghostCandles.length > 0}
          onClick={() => {
            const ghosts = onPreview();
            if (ghosts.length > 0) {
              setGhostCandles(ghosts);
              sound.play('reveal');
              vibrate(15);
            }
          }}
        >
          <span className="play-btn-main">◉ 엿보기</span>
          <span className="play-btn-sub">다음 3틱</span>
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
        .play-char-sprite {
          width: 28px;
          height: 28px;
          image-rendering: pixelated;
        }
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
        .play-tutorial {
          text-align: center;
          font-size: 12px;
          color: var(--accent);
          background: rgba(230,126,34,0.1);
          border: 1px solid var(--accent);
          border-radius: 4px;
          padding: 8px 10px;
          letter-spacing: 0.5px;
          font-weight: bold;
          animation: fadeSlideIn 0.2s ease-out;
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
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1px;
          color: #fff;
          transition: opacity 0.15s;
          line-height: 1.2;
        }
        .play-btn-main { font-size: 12px; }
        .play-btn-sub { font-size: 7px; opacity: 0.7; letter-spacing: 0.5px; }
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
