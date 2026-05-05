import type { Candle, MarketState } from '../types';
import { defaultRng, type RNG } from '../utils/rng';

// Box-Muller 변환: 표준정규분포 난수 생성
function gaussianRandom(rng: RNG): number {
  let u = 0, v = 0;
  while (u === 0) u = rng.random();
  while (v === 0) v = rng.random();
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

function lerp(min: number, max: number, rng: RNG): number {
  return min + rng.random() * (max - min);
}

/**
 * 주어진 상태(state)에 따라 한 틱의 캔들을 생성한다.
 */
export function generateCandle(
  prevClose: number,
  state: MarketState,
  time: number,
  rng: RNG = defaultRng,
): Candle {
  const params = STATE_PARAMS[state];
  const sigma = lerp(params.sigmaMin, params.sigmaMax, rng);
  const mu = lerp(params.muMin, params.muMax, rng);

  const Z = gaussianRandom(rng);
  const open = prevClose;
  const close = prevClose * (1 + mu + sigma * Z);

  const highBase = Math.max(open, close);
  const lowBase = Math.min(open, close);

  const isShock = state === 'SHOCK_UP' || state === 'SHOCK_DOWN';
  const wickFactor = isShock ? 0 : sigma * 0.5;

  const high = highBase * (1 + Math.abs(rng.random()) * wickFactor);
  const low = lowBase * (1 - Math.abs(rng.random()) * wickFactor);

  return {
    time,
    open: Math.round(open * 100) / 100,
    high: Math.round(high * 100) / 100,
    low: Math.round(low * 100) / 100,
    close: Math.round(close * 100) / 100,
  };
}
