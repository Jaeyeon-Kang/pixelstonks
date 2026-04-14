// === 차트 엔진 타입 ===

export interface Candle {
  time: number;       // 0~29 (초)
  open: number;
  high: number;
  low: number;
  close: number;
}

export type MarketState = 'BOX' | 'TREND_UP' | 'TREND_DOWN' | 'SHOCK_UP' | 'SHOCK_DOWN';

export interface StateSegment {
  state: MarketState;
  duration: number;   // 초 단위
}

// === 시나리오 이벤트 (뉴스 헤드라인) ===

export interface ScenarioEvent {
  tick: number;                                   // 이벤트 발생 틱
  headline: string;                               // 뉴스 헤드라인 텍스트
  type: 'info' | 'bullish' | 'bearish' | 'shock'; // 이벤트 감정 색상
}

export interface Scenario {
  id: number;
  name: string;
  nameKo: string;
  description: string;       // 시나리오 한줄 설명
  segments: StateSegment[];
  events: ScenarioEvent[];   // 뉴스 이벤트 목록
  weight: number;
}

// === 캐릭터 타입 ===

export type CharacterId = 'samsong' | 'teslur' | 'gemstop' | 'lunacoing' | 'envidio';

export interface Character {
  id: CharacterId;
  name: string;
  emoji: string;
  spawnRate: number;                    // 등장 확률 (0~1)
  scenarioWeightOverrides: number[];    // 가중치 ×2 적용할 시나리오 ID 목록
}

// === 게임 상태 타입 ===

export type Position = 'NONE' | 'HOLDING';

export interface GameState {
  phase: 'HOME' | 'MATCHING' | 'PLAYING' | 'RESULT';
  character: Character | null;
  scenario: Scenario | null;
  candles: Candle[];
  currentTick: number;         // 0~29
  tradesLeft: number;          // 3에서 시작, BUY/SELL 시 차감
  position: Position;
  entryPrice: number | null;
  currentPrice: number;
  profitRate: number;          // (현재가 - 진입가) / 진입가 * 100
  timeLeft: number;            // 30에서 카운트다운
  finalProfitRate: number | null;
  currentEvent: ScenarioEvent | null;  // 현재 표시 중인 이벤트
}

// === 밈 문구 타입 ===

export type ProfitTier = 'legend' | 'beast' | 'normal' | 'meh' | 'ant' | 'dead' | 'doom';

// === 리더보드 타입 ===

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  nickname: string;
  character_id: CharacterId;
  scenario_id: number;
  profit_rate: number;
  played_at: string;
  rank?: number;
}

// === 설정 타입 ===

export interface GameConfig {
  initialPrice: number;
  totalTicks: number;
  maxTrades: number;
  adIntervalGames: number;    // N판마다 전면광고
}
