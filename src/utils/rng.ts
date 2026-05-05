// 시드 가능한 PRNG (mulberry32)
// 일일 챌린지·튜토리얼처럼 결정론적 결과가 필요한 곳에서 사용

export interface RNG {
  random(): number;
}

export function mulberry32(seed: number): RNG {
  let s = seed >>> 0;
  return {
    random() {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
}

export const defaultRng: RNG = {
  random: () => Math.random(),
};

/** YYYYMMDD 정수 시드 (KST 기준) */
export function dailySeed(date: Date = new Date()): number {
  // KST 기준으로 일자를 잡아야 자정 넘기는 시점이 한국 사용자와 일치
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const y = kst.getUTCFullYear();
  const m = kst.getUTCMonth() + 1;
  const d = kst.getUTCDate();
  return y * 10000 + m * 100 + d;
}

/** YYYY-MM-DD 문자열 (KST) */
export function dailyKey(date: Date = new Date()): string {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(kst.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
