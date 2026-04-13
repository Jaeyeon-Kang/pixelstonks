import type { Character } from '../types';

export const CHARACTERS: Character[] = [
  {
    id: 'ttukssang',
    name: '떡상이 🚀',
    emoji: '🚀',
    spawnRate: 0.25,
    scenarioWeightOverrides: [2, 4, 9],  // 우상향, 떡상후폭락, 상한가
  },
  {
    id: 'gaemi',
    name: '개미장군 🐜',
    emoji: '🐜',
    spawnRate: 0.25,
    scenarioWeightOverrides: [10, 4],    // 단절, 떡상후폭락
  },
  {
    id: 'jonber',
    name: '존버러스 🪨',
    emoji: '🪨',
    spawnRate: 0.20,
    scenarioWeightOverrides: [1, 7],     // 잔잔한호수, 계단상승
  },
  {
    id: 'buffett',
    name: '버핏햄찌 🐹',
    emoji: '🐹',
    spawnRate: 0.20,
    scenarioWeightOverrides: [1, 7, 6],  // 잔잔한호수, 계단상승, 쌍바닥
  },
  {
    id: 'panic',
    name: '패닉이 😱',
    emoji: '😱',
    spawnRate: 0.10,
    scenarioWeightOverrides: [8, 5, 10], // 롤러코스터, V자반등, 단절
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
