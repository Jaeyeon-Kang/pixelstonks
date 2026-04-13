import type { GameConfig } from '../types';

export const GAME_CONFIG: GameConfig = {
  initialPrice: 10000,
  totalTicks: 30,
  maxTrades: 3,
  adIntervalGames: Number(import.meta.env.VITE_AD_INTERVAL_GAMES ?? 3),
};

// 모던 레트로 팔레트 (남색 베이스 + 소프트 그린 포인트)
export const PALETTE = {
  bgPrimary: '#1a1c2c',     // 배경: 짙은 남색
  bgSecondary: '#2a2e3f',   // 보조 배경
  surface: '#252840',       // 카드/패널
  fgPrimary: '#a8c256',     // 포인트: 부드러운 연두
  fgSecondary: '#d4e8b0',   // 강조 텍스트
  muted: '#5a6078',         // 비활성 텍스트
  profit: '#5bb5f5',        // 수익 = 부드러운 파랑
  loss: '#f06868',          // 손실 = 부드러운 빨강
  accent: '#ffcf40',        // 골드
} as const;
