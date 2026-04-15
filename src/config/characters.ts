import type { Character } from '../types';

// 패러디 티커 (아는 사람은 피식 웃는 수준)
// 실제 종목명 사용 불가 (앱인토스 검수) → GTA식 패러디
export const CHARACTERS: Character[] = [
  {
    id: 'samsong',
    name: '삼송전기',
    sprite: '/sprites/samsong.svg',
    spawnRate: 0.25,
    scenarioWeightOverrides: [5, 7, 6],  // V자반등, 계단상승, 쌍바닥
  },
  {
    id: 'teslur',
    name: '테슬러모터스',
    sprite: '/sprites/teslur.svg',
    spawnRate: 0.25,
    scenarioWeightOverrides: [2, 9, 7],  // 우상향, 상한가, 계단상승
  },
  {
    id: 'gemstop',
    name: '겜스톱',
    sprite: '/sprites/gemstop.svg',
    spawnRate: 0.20,
    scenarioWeightOverrides: [4, 8, 10], // 떡상후폭락, 롤러코스터, 절벽
  },
  {
    id: 'lunacoing',
    name: '루나코잉',
    sprite: '/sprites/lunacoing.svg',
    spawnRate: 0.20,
    scenarioWeightOverrides: [3, 10, 8], // 우하향지옥, 절벽, 롤러코스터
  },
  {
    id: 'envidio',
    name: '엔비디오',
    sprite: '/sprites/envidio.svg',
    spawnRate: 0.10,
    scenarioWeightOverrides: [7, 2, 9],  // 계단상승, 우상향, 상한가
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
