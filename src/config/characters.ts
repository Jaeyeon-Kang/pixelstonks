import type { Character } from '../types';

// 패러디 티커 (아는 사람은 피식 웃는 수준)
// 실제 종목명 사용 불가 (앱인토스 검수) → GTA식 패러디
export const CHARACTERS: Character[] = [
  // ── 기존 종목 (시나리오 다변화) ──
  {
    id: 'samsong',
    name: '삼송전기',
    sprite: '/sprites/samsong.svg',
    spawnRate: 0.14,
    scenarioWeightOverrides: [5, 7, 1, 3],  // V자반등, 계단상승, 잔잔한호수, 우하향지옥
  },
  {
    id: 'teslur',
    name: '테슬러모터스',
    sprite: '/sprites/teslur.svg',
    spawnRate: 0.13,
    scenarioWeightOverrides: [2, 9, 4, 10], // 우상향, 상한가, 떡상후폭락, 절벽
  },
  {
    id: 'gemstop',
    name: '겜스톱',
    sprite: '/sprites/gemstop.svg',
    spawnRate: 0.12,
    scenarioWeightOverrides: [4, 8, 9, 3],  // 떡상후폭락, 롤러코스터, 상한가, 우하향지옥
  },
  {
    id: 'lunacoing',
    name: '루나코잉',
    sprite: '/sprites/lunacoing.svg',
    spawnRate: 0.12,
    scenarioWeightOverrides: [3, 10, 4, 2], // 우하향지옥, 절벽, 떡상후폭락, 우상향
  },
  {
    id: 'envidio',
    name: '엔비디오',
    sprite: '/sprites/envidio.svg',
    spawnRate: 0.09,
    scenarioWeightOverrides: [7, 2, 8, 3],  // 계단상승, 우상향, 롤러코스터, 우하향지옥
  },
  // ── 신규 종목 4종 ──
  {
    id: 'kakamot',
    name: '카카못',
    sprite: '/sprites/kakamot.svg',
    spawnRate: 0.13,
    scenarioWeightOverrides: [3, 1, 10, 6], // 우하향지옥, 잔잔한호수, 절벽, 쌍바닥
  },
  {
    id: 'hannwa',
    name: '한놔에어',
    sprite: '/sprites/hannwa.svg',
    spawnRate: 0.10,
    scenarioWeightOverrides: [9, 4, 8, 10], // 상한가, 떡상후폭락, 롤러코스터, 절벽
  },
  {
    id: 'crapton',
    name: '크랩톤',
    sprite: '/sprites/crapton.svg',
    spawnRate: 0.09,
    scenarioWeightOverrides: [1, 5, 6, 8],  // 잔잔한호수, V자반등, 쌍바닥, 롤러코스터
  },
  {
    id: 'kupang',
    name: '쿠빵',
    sprite: '/sprites/kupang.svg',
    spawnRate: 0.08,
    scenarioWeightOverrides: [3, 10, 5, 1], // 우하향지옥, 절벽, V자반등, 잔잔한호수
  },
];

export function pickCharacter(): Character {
  const roll = Math.random();
  let cumulative = 0;
  for (const char of CHARACTERS) {
    cumulative += char.spawnRate;
    if (roll <= cumulative) return char;
  }
  return CHARACTERS[0];
}
