import type { GameConfig } from '../types';

export const GAME_CONFIG: GameConfig = {
  initialPrice: 10000,
  totalTicks: 30,
  maxTrades: 3,
  adIntervalGames: Number(import.meta.env.VITE_AD_INTERVAL_GAMES ?? 3),
};

// 라이트 레트로 팔레트 (따뜻한 크림 베이스)
export const PALETTE = {
  bgPrimary: '#faf8f4',     // 차트 배경: 밝은 크림
  bgSecondary: '#f0ebe3',   // 보조 배경
  surface: '#ffffff',       // 카드/패널
  fgPrimary: '#1a1a2e',     // 주요 텍스트
  fgSecondary: '#9a9ab0',   // 보조 텍스트 / 진입가 라벨
  muted: '#ccc8c0',         // 비활성 / 그리드
  profit: '#d63031',        // 상승 = 빨강 (한국식)
  loss: '#1a6bce',          // 하락 = 파랑 (한국식)
  accent: '#e67e22',        // 포인트 주황
} as const;
