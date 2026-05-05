import type { Candle, Character, MarketState, Scenario, StateSegment } from '../types';
import { GAME_CONFIG } from '../config/gameConfig';
import { generateCandle } from './candleGenerator';
import { SCENARIOS } from './scenarios';
import { defaultRng, type RNG } from '../utils/rng';

/**
 * 캐릭터의 시나리오 가중치 오버라이드를 적용해 시나리오 1개를 뽑는다.
 * 오버라이드 대상 시나리오는 가중치 ×2.
 */
export function pickScenario(character: Character, rng: RNG = defaultRng): Scenario {
  const weighted = SCENARIOS.map((s) => ({
    scenario: s,
    weight: character.scenarioWeightOverrides.includes(s.id) ? s.weight * 2 : s.weight,
  }));

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let roll = rng.random() * totalWeight;

  for (const { scenario, weight } of weighted) {
    roll -= weight;
    if (roll <= 0) return scenario;
  }

  return SCENARIOS[0];
}

function expandSegments(segments: StateSegment[]): MarketState[] {
  const timeline: MarketState[] = [];
  for (const seg of segments) {
    for (let i = 0; i < seg.duration; i++) {
      timeline.push(seg.state);
    }
  }
  while (timeline.length < GAME_CONFIG.totalTicks) {
    timeline.push(timeline[timeline.length - 1] ?? 'BOX');
  }
  return timeline.slice(0, GAME_CONFIG.totalTicks);
}

/**
 * 시나리오를 기반으로 30개 캔들을 미리 생성한다.
 * 게임 시작 시 한 번 호출하고, 1초마다 1개씩 공개하는 방식.
 */
export function generateAllCandles(scenario: Scenario, rng: RNG = defaultRng): Candle[] {
  const segments = scenario.buildSegments ? scenario.buildSegments(rng) : scenario.segments;
  const timeline = expandSegments(segments);
  const candles: Candle[] = [];
  let prevClose = GAME_CONFIG.initialPrice;

  for (let t = 0; t < GAME_CONFIG.totalTicks; t++) {
    const candle = generateCandle(prevClose, timeline[t], t, rng);
    candles.push(candle);
    prevClose = candle.close;
  }

  return candles;
}
