// 닉네임 직접 입력 방식 (Option B)
// 첫 게임 시 닉네임 입력 모달 → localStorage 저장

const NICK_KEY = 'pixel-stonks-nickname';

/** 저장된 닉네임 로드 (없으면 null) */
export function loadNickname(): string | null {
  return localStorage.getItem(NICK_KEY);
}

/** 닉네임 저장 */
export function saveNickname(nick: string): void {
  localStorage.setItem(NICK_KEY, nick.trim());
}

/** 닉네임이 유효한지 체크 */
export function isValidNickname(nick: string): boolean {
  const trimmed = nick.trim();
  return trimmed.length >= 2 && trimmed.length <= 8;
}
