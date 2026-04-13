import type { Scenario, ScenarioEvent, StateSegment } from '../types';

// 시나리오 10종 (이벤트 헤드라인 포함)
export const SCENARIOS: Scenario[] = [
  {
    id: 1,
    name: 'calm-lake',
    nameKo: '잔잔한 호수',
    description: '특별한 이슈 없는 평화로운 장',
    weight: 8,
    segments: [{ state: 'BOX', duration: 30 }],
    events: [
      { tick: 0, headline: '📋 특별 이슈 없음... 조용한 장세', type: 'info' },
      { tick: 15, headline: '😴 거래량 부진, 관망세 지속', type: 'info' },
    ],
  },
  {
    id: 2,
    name: 'bull-run',
    nameKo: '우상향',
    description: '꾸준히 올라가는 상승장',
    weight: 10,
    segments: [{ state: 'TREND_UP', duration: 30 }],
    events: [
      { tick: 0, headline: '📈 기관 매수세 유입! 상승 출발', type: 'bullish' },
      { tick: 12, headline: '🔥 외인 동반 매수, 상승 가속', type: 'bullish' },
      { tick: 22, headline: '🚀 52주 신고가 돌파!', type: 'bullish' },
    ],
  },
  {
    id: 3,
    name: 'bear-hell',
    nameKo: '우하향 지옥',
    description: '끝없이 하락하는 공포장',
    weight: 10,
    segments: [{ state: 'TREND_DOWN', duration: 30 }],
    events: [
      { tick: 0, headline: '📉 악재 연발, 투매 시작', type: 'bearish' },
      { tick: 10, headline: '🩸 반대매매 쏟아져...', type: 'bearish' },
      { tick: 20, headline: '💀 패닉셀! 바닥은 어디?', type: 'shock' },
    ],
  },
  {
    id: 4,
    name: 'pump-and-dump',
    nameKo: '떡상 후 폭락',
    description: '급등 후 세력 매도로 폭락',
    weight: 12,
    segments: [
      { state: 'BOX', duration: 10 },
      { state: 'TREND_UP', duration: 10 },
      { state: 'SHOCK_DOWN', duration: 2 },
      { state: 'TREND_DOWN', duration: 8 },
    ],
    events: [
      { tick: 0, headline: '📋 보합세... 눈치 보는 중', type: 'info' },
      { tick: 10, headline: '📈 거래량 폭증! 매수세 몰린다', type: 'bullish' },
      { tick: 18, headline: '💣 대주주 지분 전량 매도!', type: 'shock' },
      { tick: 22, headline: '📉 투매... 개미들 탈출 중', type: 'bearish' },
    ],
  },
  {
    id: 5,
    name: 'v-reversal',
    nameKo: 'V자 반등',
    description: '급락 후 극적인 반등',
    weight: 12,
    segments: [
      { state: 'TREND_DOWN', duration: 15 },
      { state: 'SHOCK_UP', duration: 2 },
      { state: 'TREND_UP', duration: 13 },
    ],
    events: [
      { tick: 0, headline: '📉 시장 약세, 하락 출발', type: 'bearish' },
      { tick: 8, headline: '🩸 공포 확산, 매도 가속', type: 'bearish' },
      { tick: 15, headline: '⚡ 긴급! 정부 부양책 발표!', type: 'shock' },
      { tick: 18, headline: '📈 V자 반등 시작!', type: 'bullish' },
    ],
  },
  {
    id: 6,
    name: 'double-bottom',
    nameKo: '쌍바닥',
    description: '두 번 바닥 찍고 상승 전환',
    weight: 10,
    segments: [
      { state: 'TREND_DOWN', duration: 8 },
      { state: 'BOX', duration: 6 },
      { state: 'TREND_DOWN', duration: 4 },
      { state: 'TREND_UP', duration: 12 },
    ],
    events: [
      { tick: 0, headline: '📉 1차 하락, 지지선 테스트', type: 'bearish' },
      { tick: 8, headline: '📋 반등 시도... 바닥인가?', type: 'info' },
      { tick: 14, headline: '📉 2차 하락! 쌍바닥 패턴?', type: 'bearish' },
      { tick: 18, headline: '📈 지지 확인! 매수세 유입', type: 'bullish' },
    ],
  },
  {
    id: 7,
    name: 'staircase',
    nameKo: '계단 상승',
    description: '단계적으로 올라가는 건전한 상승',
    weight: 10,
    segments: [
      { state: 'BOX', duration: 5 },
      { state: 'TREND_UP', duration: 5 },
      { state: 'BOX', duration: 5 },
      { state: 'TREND_UP', duration: 5 },
      { state: 'BOX', duration: 5 },
      { state: 'TREND_UP', duration: 5 },
    ],
    events: [
      { tick: 0, headline: '📋 1단계: 매집 구간', type: 'info' },
      { tick: 5, headline: '📈 돌파! 1차 상승', type: 'bullish' },
      { tick: 10, headline: '📋 조정 후 눌림목 지지', type: 'info' },
      { tick: 15, headline: '📈 2차 상승! 추세 확인', type: 'bullish' },
      { tick: 20, headline: '📋 3단계 눌림목...', type: 'info' },
      { tick: 25, headline: '🚀 3차 상승! 가속!', type: 'bullish' },
    ],
  },
  {
    id: 8,
    name: 'roller-coaster',
    nameKo: '롤러코스터',
    description: '미친 변동성, 방향 예측 불가',
    weight: 8,
    segments: buildRollerCoaster(),
    events: [
      { tick: 0, headline: '⚡ 경고: 극심한 변동성!', type: 'shock' },
      { tick: 8, headline: '🎢 롤러코스터 장세 지속!', type: 'shock' },
      { tick: 16, headline: '🌪️ 혼돈의 카오스...', type: 'shock' },
      { tick: 24, headline: '⚡ 어지러워... 언제 끝나?', type: 'shock' },
    ],
  },
  {
    id: 9,
    name: 'limit-up',
    nameKo: '상한가',
    description: '긴 횡보 후 갑작스러운 폭등',
    weight: 10,
    segments: [
      { state: 'BOX', duration: 20 },
      { state: 'SHOCK_UP', duration: 2 },
      { state: 'TREND_UP', duration: 8 },
    ],
    events: [
      { tick: 0, headline: '📋 잠잠한 횡보... 재미없다', type: 'info' },
      { tick: 10, headline: '😴 거래량 최저, 지루한 장', type: 'info' },
      { tick: 20, headline: '⚡ 속보! 대형 호재 발표!', type: 'shock' },
      { tick: 22, headline: '🚀 상한가 직행!! 가즈아!', type: 'bullish' },
    ],
  },
  {
    id: 10,
    name: 'cliff',
    nameKo: '절벽',
    description: '상승 후 갑작스러운 폭락',
    weight: 10,
    segments: [
      { state: 'TREND_UP', duration: 10 },
      { state: 'SHOCK_DOWN', duration: 2 },
      { state: 'TREND_DOWN', duration: 18 },
    ],
    events: [
      { tick: 0, headline: '📈 순항 중... 좋은 흐름', type: 'bullish' },
      { tick: 6, headline: '🔥 신고가 근접, 기대감 UP', type: 'bullish' },
      { tick: 10, headline: '💣 긴급! 실적 쇼크 발표!', type: 'shock' },
      { tick: 14, headline: '📉 절벽 하락... 탈출 불가', type: 'bearish' },
    ],
  },
];

// 롤러코스터: SHOCK(2) 15회, 방향 랜덤
function buildRollerCoaster(): StateSegment[] {
  const segments: StateSegment[] = [];
  for (let i = 0; i < 15; i++) {
    const direction = Math.random() > 0.5 ? 'SHOCK_UP' : 'SHOCK_DOWN';
    segments.push({ state: direction, duration: 2 });
  }
  return segments;
}
