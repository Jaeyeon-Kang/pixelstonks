import type { Candle } from '../types';
import { PALETTE } from '../config/gameConfig';

const CANDLE_GAP = 2;         // 캔들 사이 간격 (px)
const CHART_PADDING_TOP = 10;
const CHART_PADDING_BOTTOM = 10;
const WICK_WIDTH = 1;         // 꼬리 두께

export interface ChartRenderOptions {
  width: number;
  height: number;
  entryPrice: number | null;
  yMin?: number;
  yMax?: number;
  ghostCandles?: Candle[];
}

/**
 * Canvas에 캔들차트를 그린다.
 * visibleCandles: 현재까지 공개된 캔들 배열 (0~currentTick)
 */
export function renderChart(
  ctx: CanvasRenderingContext2D,
  visibleCandles: Candle[],
  options: ChartRenderOptions,
): void {
  const { width, height, entryPrice, yMin, yMax, ghostCandles = [] } = options;

  // 픽셀아트 설정
  ctx.imageSmoothingEnabled = false;

  // 배경 클리어
  ctx.fillStyle = PALETTE.bgPrimary;
  ctx.fillRect(0, 0, width, height);

  if (visibleCandles.length === 0) return;

  // 전체 30캔들 기준 너비 계산 (항상 30칸 자리 확보)
  const totalSlots = 30;
  const candleWidth = Math.floor((width - CANDLE_GAP * (totalSlots + 1)) / totalSlots);

  // 가격 범위: 외부에서 전달된 확장 윈도우 우선 사용 (차트가 줄어들지 않도록)
  let maxPrice: number;
  let minPrice: number;
  if (yMin !== undefined && yMax !== undefined) {
    minPrice = yMin;
    maxPrice = yMax;
  } else {
    const allHighs = visibleCandles.map((c) => c.high);
    const allLows = visibleCandles.map((c) => c.low);
    if (entryPrice !== null) {
      allHighs.push(entryPrice);
      allLows.push(entryPrice);
    }
    maxPrice = Math.max(...allHighs);
    minPrice = Math.min(...allLows);
  }
  const priceRange = maxPrice - minPrice || 1;
  const chartHeight = height - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

  // 가격 → y좌표 변환
  const priceToY = (price: number): number => {
    return Math.round(CHART_PADDING_TOP + chartHeight * (1 - (price - minPrice) / priceRange));
  };

  // 그리드 라인 (수평, 가격 보조선 4개)
  ctx.strokeStyle = PALETTE.muted + '40'; // 25% 투명
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    const gridPrice = minPrice + (priceRange * i) / 4;
    const y = priceToY(gridPrice);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 진입가 수평선
  if (entryPrice !== null) {
    const entryY = priceToY(entryPrice);
    ctx.strokeStyle = PALETTE.fgSecondary;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, entryY);
    ctx.lineTo(width, entryY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 진입가 라벨
    ctx.fillStyle = PALETTE.fgSecondary;
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(entryPrice)}P`, width - 4, entryY - 3);
  }

  // 캔들 렌더링
  for (const candle of visibleCandles) {
    const x = Math.round(CANDLE_GAP + candle.time * (candleWidth + CANDLE_GAP));
    const isGreen = candle.close >= candle.open; // 양봉
    const color = isGreen ? PALETTE.profit : PALETTE.loss;

    const bodyTop = priceToY(Math.max(candle.open, candle.close));
    const bodyBottom = priceToY(Math.min(candle.open, candle.close));
    const bodyHeight = Math.max(bodyBottom - bodyTop, 1); // 최소 1px

    ctx.fillStyle = color;
    const wickX = Math.round(x + candleWidth / 2);
    const wickTop = priceToY(candle.high);
    const wickBottom = priceToY(candle.low);
    ctx.fillRect(wickX, wickTop, WICK_WIDTH, wickBottom - wickTop);
    ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
  }

  // 고스트 캔들 (엿보기 미리보기) — 회색, 점선 외곽
  // 실제 캔들이 이미 점유한 time은 자연스럽게 가려지도록 필터링
  const visibleTimes = new Set(visibleCandles.map((c) => c.time));
  const futureGhosts = ghostCandles.filter((g) => !visibleTimes.has(g.time));
  if (futureGhosts.length > 0) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    for (const candle of futureGhosts) {
      const x = Math.round(CANDLE_GAP + candle.time * (candleWidth + CANDLE_GAP));
      const bodyTop = priceToY(Math.max(candle.open, candle.close));
      const bodyBottom = priceToY(Math.min(candle.open, candle.close));
      const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
      const wickX = Math.round(x + candleWidth / 2);
      const wickTop = priceToY(candle.high);
      const wickBottom = priceToY(candle.low);

      ctx.fillStyle = PALETTE.muted;
      ctx.fillRect(wickX, wickTop, WICK_WIDTH, wickBottom - wickTop);

      // 몸통은 외곽선만 (속이 빈 미리보기 느낌)
      ctx.strokeStyle = PALETTE.fgSecondary;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 1]);
      ctx.strokeRect(x + 0.5, bodyTop + 0.5, candleWidth - 1, Math.max(bodyHeight - 1, 1));
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  // 현재가 라벨 (마지막 캔들)
  const lastCandle = visibleCandles[visibleCandles.length - 1];
  const lastY = priceToY(lastCandle.close);
  const lastColor = lastCandle.close >= lastCandle.open ? PALETTE.profit : PALETTE.loss;

  ctx.fillStyle = lastColor;
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';
  const lastX = CANDLE_GAP + lastCandle.time * (candleWidth + CANDLE_GAP) + candleWidth + 4;
  ctx.fillText(`${Math.round(lastCandle.close)}P`, Math.min(lastX, width - 50), lastY + 4);
}
