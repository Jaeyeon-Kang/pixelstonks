// 디바이스별 익명 유저 ID 관리
// UUID v4 생성 후 localStorage에 저장

const USER_ID_KEY = 'pixel-stonks-user-id';

function generateUUID(): string {
  // crypto.randomUUID() 지원 시 사용, 아니면 폴백
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // 폴백: Math.random 기반 UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** 유저 ID 로드 (없으면 생성) */
export function getUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}
