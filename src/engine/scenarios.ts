import type { Scenario, StateSegment } from '../types';

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
      { tick: 0, headline: '[시황] 뚜렷한 재료 없이 보합 출발', type: 'info' },
      { tick: 15, headline: '[시황] 거래량 바닥, 눈치 장세 지속', type: 'info' },
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
      { tick: 0, headline: '[속보] 외국인·기관 동시 순매수 포착', type: 'bullish' },
      { tick: 12, headline: '[속보] 거래대금 급증, 매수세 가속', type: 'bullish' },
      { tick: 22, headline: '[속보] 52주 신고가 경신!', type: 'bullish' },
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
      { tick: 0, headline: '[속보] 대규모 악재 발생, 투매 출회', type: 'bearish' },
      { tick: 10, headline: '[긴급] 신용잔고 반대매매 물량 쏟아져', type: 'bearish' },
      { tick: 20, headline: '[긴급] 패닉셀 확산... 하한가 근접', type: 'shock' },
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
      { tick: 0, headline: '[시황] 거래량 감소, 방향성 탐색 중', type: 'info' },
      { tick: 10, headline: '[속보] 수급 급변! 대량 매수 체결', type: 'bullish' },
      { tick: 18, headline: '[긴급] 최대주주 지분 전량 장내 매도', type: 'shock' },
      { tick: 22, headline: '[속보] 개미 투매 러시, 매도 잔량 폭증', type: 'bearish' },
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
      { tick: 0, headline: '[속보] 외국인 대량 매도, 약세 출발', type: 'bearish' },
      { tick: 8, headline: '[긴급] 공포지수 급등, 투매 확산', type: 'bearish' },
      { tick: 15, headline: '[긴급] 정부 긴급 시장안정 대책 발표', type: 'shock' },
      { tick: 18, headline: '[속보] 기관 저가 매수 유입, 반등 시작', type: 'bullish' },
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
      { tick: 0, headline: '[속보] 주요 지지선 이탈, 1차 하락', type: 'bearish' },
      { tick: 8, headline: '[시황] 낙폭 과대 인식, 반등 시도', type: 'info' },
      { tick: 14, headline: '[속보] 전저점 재차 하회, 2차 하락', type: 'bearish' },
      { tick: 18, headline: '[속보] 쌍바닥 지지 확인, 기관 매수 유입', type: 'bullish' },
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
      { tick: 0, headline: '[시황] 거래량 미미, 횡보 지속', type: 'info' },
      { tick: 5, headline: '[속보] 저항선 돌파! 거래량 동반 상승', type: 'bullish' },
      { tick: 10, headline: '[시황] 단기 차익 실현 매물 소화 중', type: 'info' },
      { tick: 15, headline: '[속보] 2차 돌파, 상승 추세 확인', type: 'bullish' },
      { tick: 20, headline: '[시황] 눌림목 지지, 매물 소화 완료', type: 'info' },
      { tick: 25, headline: '[속보] 3차 상승 가속! 신고가 도전', type: 'bullish' },
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
      { tick: 0, headline: '[긴급] 변동성 지수 급등, 방향 예측 불가', type: 'shock' },
      { tick: 8, headline: '[긴급] 알고리즘 매매 폭주, 급등락 반복', type: 'shock' },
      { tick: 16, headline: '[긴급] 매수·매도 호가 동시 소멸', type: 'shock' },
      { tick: 24, headline: '[긴급] 서킷브레이커 검토 중...', type: 'shock' },
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
      { tick: 0, headline: '[시황] 특이사항 없음, 한산한 거래', type: 'info' },
      { tick: 10, headline: '[시황] 거래량 금일 최저 수준', type: 'info' },
      { tick: 20, headline: '[긴급] 대규모 수주 계약 공시!', type: 'shock' },
      { tick: 22, headline: '[속보] 매수 호가 잔량 소멸, 상한가 직행', type: 'bullish' },
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
      { tick: 0, headline: '[속보] 호실적 기대감에 매수세 유입', type: 'bullish' },
      { tick: 6, headline: '[속보] 52주 신고가 근접, 돌파 기대', type: 'bullish' },
      { tick: 10, headline: '[긴급] 어닝 쇼크! 영업이익 적자 전환', type: 'shock' },
      { tick: 14, headline: '[속보] 기관·외인 동시 투매, 낙폭 확대', type: 'bearish' },
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
