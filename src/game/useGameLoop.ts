import { useCallback, useEffect, useRef, useState } from 'react';
import type { Candle, Character, GameState, Position, Scenario } from '../types';
import { GAME_CONFIG } from '../config/gameConfig';
import { generateAllCandles, pickScenario } from '../engine/chartEngine';
import { pickCharacter } from '../config/characters';

const INITIAL_STATE: GameState = {
  phase: 'HOME',
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

export function useGameLoop() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const allCandles = useRef<Candle[]>([]);

  // 게임 시작: 캐릭터 뽑기 → 매칭 연출 → 플레이
  const startGame = useCallback(() => {
    const character = pickCharacter();
    const scenario = pickScenario(character);
    const candles = generateAllCandles(scenario);
    allCandles.current = candles;

    setState({
      ...INITIAL_STATE,
      phase: 'MATCHING',
      character,
      scenario,
      candles: [],
    });

    // 매칭 연출 3초 후 플레이 시작
    setTimeout(() => {
      setState((prev) => ({ ...prev, phase: 'PLAYING', currentTick: -1 }));
    }, 3000);
  }, []);

  // 플레이 진입 시 1초 타이머 시작
  useEffect(() => {
    if (state.phase !== 'PLAYING') return;

    tickTimer.current = setInterval(() => {
      setState((prev) => {
        const nextTick = prev.currentTick + 1;

        // 이벤트 감지: 현재 틱에 매칭되는 이벤트 확인
        const event = prev.scenario?.events.find((e) => e.tick === nextTick) ?? null;

        if (nextTick >= GAME_CONFIG.totalTicks) {
          // 30초 끝 → 결과
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

  // 매매 액션
  const executeTrade = useCallback((action: 'BUY' | 'SELL' | 'HOLD') => {
    setState((prev) => {
      if (prev.phase !== 'PLAYING') return prev;

      // HOLD는 매매권 소모 안 함
      if (action === 'HOLD') return prev;

      if (prev.tradesLeft <= 0) return prev;

      if (action === 'BUY' && prev.position === 'NONE') {
        return {
          ...prev,
          position: 'HOLDING' as Position,
          entryPrice: prev.currentPrice,
          tradesLeft: prev.tradesLeft - 1,
        };
      }

      if (action === 'SELL' && prev.position === 'HOLDING') {
        // 매도 시 수익률 확정 (이후 관망)
        const profitRate = prev.entryPrice
          ? ((prev.currentPrice - prev.entryPrice) / prev.entryPrice) * 100
          : 0;
        return {
          ...prev,
          position: 'NONE' as Position,
          tradesLeft: prev.tradesLeft - 1,
          profitRate,
        };
      }

      return prev;
    });
  }, []);

  const goHome = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return { state, startGame, executeTrade, goHome };
}
