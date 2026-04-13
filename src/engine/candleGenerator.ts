import type { Candle, MarketState } from '../types';

// Box-Muller 변환: 표준정규분포 난수 생성
function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// 상태별 파라미터 범위
const STATE_PARAMS: Record<MarketState, { sigmaMin: number; sigmaMax: number; muMin: number; muMax: number }> = {
  BOX:        { sigmaMin: 0.002, sigmaMax: 0.004, muMin: 0,      muMax: 0 },
  TREND_UP:   { sigmaMin: 0.008, sigmaMax: 0.012, muMin: 0.015,  muMax: 0.030 },
  TREND_DOWN: { sigmaMin: 0.008, sigmaMax: 0.012, muMin: -0.030, muMax: -0.015 },
  SHOCK_UP:   { sigmaMin: 0,     sigmaMax: 0,     muMin: 0.08,   muMax: 0.15 },
  SHOCK_DOWN: { sigmaMin: 0,     sigmaMax: 0,     muMin: -0.15,  muMax: -0.08 },
};

function lerp(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * 주어진 상태(state)에 따라 한 틱의 캔들을 생성한다.
 *
 * close_t = close_{t-1} × (1 + μ_per_tick + σ × Z)
 * open_t = close_{t-1}
 * high_t = max(open, close) × (1 + |random| × σ × 0.5)
 * low_t  = min(open, close) × (1 - |random| × σ × 0.5)
 */
export function generateCandle(
  prevClose: number,
  state: MarketState,
  time: number,
): Candle {
  const params = STATE_PARAMS[state];
  const sigma = lerp(params.sigmaMin, params.sigmaMax);
  const mu = lerp(params.muMin, params.muMax);

  const Z = gaussianRandom();
  const open = prevClose;
  const close = prevClose * (1 + mu + sigma * Z);

  const highBase = Math.max(open, close);
  const lowBase = Math.min(open, close);

  // 위꼬리/아래꼬리 (BOX/TREND에만 적용, SHOCK은 몸통 그대로)
  const isShock = state === 'SHOCK_UP' || state === 'SHOCK_DOWN';
  const wickFactor = isShock ? 0 : sigma * 0.5;

  const high = highBase * (1 + Math.abs(Math.random()) * wickFactor);
  const low = lowBase * (1 - Math.abs(Math.random()) * wickFactor);

  return {
    time,
    open: Math.round(open * 100) / 100,
    high: Math.round(high * 100) / 100,
    low: Math.round(low * 100) / 100,
    close: Math.round(close * 100) / 100,
  };
}
