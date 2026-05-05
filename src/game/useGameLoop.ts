import { useCallback, useEffect, useRef, useState } from 'react';
import type { Candle, GameMode, GameState, Position } from '../types';
import { GAME_CONFIG } from '../config/gameConfig';
import { generateAllCandles, pickScenario } from '../engine/chartEngine';
import { CHARACTERS, pickCharacter } from '../config/characters';
import { SCENARIOS } from '../engine/scenarios';
import { dailySeed, defaultRng, mulberry32, type RNG } from '../utils/rng';

const INITIAL_STATE: GameState = {
  phase: 'HOME',
  mode: 'normal',
  character: null,
  scenario: null,
  candles: [],
  currentTick: -1,
  tradesLeft: GAME_CONFIG.maxTrades,
  position: 'NONE',
  entryPrice: null,
  currentPrice: GAME_CONFIG.initialPrice,
  profitRate: 0,
  timeLeft: GAME_CONFIG.totalTicks,
  finalProfitRate: null,
  currentEvent: null,
};

// 튜토리얼: V자 반등 (id=5) 강제, 캐릭터는 삼송전기, 고정 시드
const TUTORIAL_SEED = 7;

export function useGameLoop() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const allCandles = useRef<Candle[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  const startGame = useCallback((mode: GameMode = 'normal') => {
    let rng: RNG;
    let character;
    let scenario;

    if (mode === 'challenge') {
      rng = mulberry32(dailySeed());
      character = pickCharacter(rng);
      scenario = pickScenario(character, rng);
    } else if (mode === 'tutorial') {
      rng = mulberry32(TUTORIAL_SEED);
      character = CHARACTERS[0]; // 삼송전기
      scenario = SCENARIOS.find((s) => s.id === 5) ?? SCENARIOS[0]; // V자 반등
    } else {
      rng = defaultRng;
      character = pickCharacter();
      scenario = pickScenario(character);
    }

    const candles = generateAllCandles(scenario, rng);
    allCandles.current = candles;

    setState({
      ...INITIAL_STATE,
      phase: 'MATCHING',
      mode,
      character,
      scenario,
      candles: [],
    });

    setTimeout(() => {
      setState((prev) => ({ ...prev, phase: 'PLAYING', currentTick: -1 }));
    }, 4500);
  }, []);

  useEffect(() => {
    if (state.phase !== 'PLAYING') return;

    tickTimer.current = setInterval(() => {
      setState((prev) => {
        const nextTick = prev.currentTick + 1;
        const event = prev.scenario?.events.find((e) => e.tick === nextTick) ?? null;

        if (nextTick >= GAME_CONFIG.totalTicks) {
          clearInterval(tickTimer.current!);
          const finalPrice = allCandles.current[GAME_CONFIG.totalTicks - 1].close;
          const finalProfit = prev.position === 'HOLDING' && prev.entryPrice
            ? ((finalPrice - prev.entryPrice) / prev.entryPrice) * 100
            : prev.profitRate;

          return {
            ...prev,
            phase: 'RESULT',
            currentTick: GAME_CONFIG.totalTicks - 1,
            candles: allCandles.current,
            currentPrice: finalPrice,
            timeLeft: 0,
            finalProfitRate: finalProfit,
            profitRate: finalProfit,
            currentEvent: null,
          };
        }

        const currentCandle = allCandles.current[nextTick];
        const currentPrice = currentCandle.close;
        const profitRate =
          prev.position === 'HOLDING' && prev.entryPrice
            ? ((currentPrice - prev.entryPrice) / prev.entryPrice) * 100
            : prev.profitRate;

        return {
          ...prev,
          currentTick: nextTick,
          candles: allCandles.current.slice(0, nextTick + 1),
          currentPrice,
          profitRate,
          timeLeft: GAME_CONFIG.totalTicks - nextTick - 1,
          currentEvent: event,
        };
      });
    }, 1000);

    return () => {
      if (tickTimer.current) clearInterval(tickTimer.current);
    };
  }, [state.phase]);

  const executeTrade = useCallback((action: 'BUY' | 'SELL') => {
    setState((prev) => {
      if (prev.phase !== 'PLAYING') return prev;

      // BUY: 매매권 소모
      if (action === 'BUY' && prev.position === 'NONE') {
        if (prev.tradesLeft <= 0) return prev;
        return {
          ...prev,
          position: 'HOLDING' as Position,
          entryPrice: prev.currentPrice,
          tradesLeft: prev.tradesLeft - 1,
        };
      }

      // SELL: 매매권 소모 안 함 (보유 중이면 항상 매도 가능)
      if (action === 'SELL' && prev.position === 'HOLDING') {
        const profitRate = prev.entryPrice
          ? ((prev.currentPrice - prev.entryPrice) / prev.entryPrice) * 100
          : 0;
        return {
          ...prev,
          position: 'NONE' as Position,
          profitRate,
        };
      }

      return prev;
    });
  }, []);

  /**
   * 다음 N캔들을 미리보기 (매매권 1개 소모)
   * 반환: 보여줄 고스트 캔들 배열 (소모 실패 시 빈 배열)
   */
  const previewNext = useCallback((count = 3): Candle[] => {
    const cur = stateRef.current;
    if (cur.phase !== 'PLAYING' || cur.tradesLeft <= 0) return [];
    const start = cur.currentTick + 1;
    const end = Math.min(start + count, GAME_CONFIG.totalTicks);
    if (start >= end) return [];
    const ghosts = allCandles.current.slice(start, end);
    setState((prev) => ({ ...prev, tradesLeft: prev.tradesLeft - 1 }));
    return ghosts;
  }, []);

  const goHome = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { state, startGame, executeTrade, previewNext, goHome };
}
