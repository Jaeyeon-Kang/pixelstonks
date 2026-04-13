// 랜덤 닉네임 생성기 (한국어 주식 밈 기반)
// 형태: [수식어] + [명사]

const ADJECTIVES = [
  '전설의', '떡상', '깡통', '존버', '풀매수',
  '야수의', '침착한', '공포의', '탐욕의', '단타',
  '장투', '물린', '불타기', '손절', '익절',
  '롱텀', '숏텀', '반등', '급등', '하한가',
  '상한가', '개미의', '세력의', '작전의', '파동',
  '눈물의', '기적의', '무한매수', '소심한', '대담한',
];

const NOUNS = [
  '개미', '고래', '투자자', '트레이더', '단타왕',
  '버핏', '소로스', '차트쟁이', '매수러', '매도러',
  '존버러', '슈퍼개미', '작전세력', '큰손', '주린이',
  '뉴비', '고수', '전업', '부자', '거지',
  '예언가', '분석가', '기관', '외인', '황소',
  '곰탱이', '로켓맨', '다이아몬드', '종이손', '강심장',
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 랜덤 닉네임 생성 (예: "떡상 개미", "전설의 단타왕") */
export function generateNickname(): string {
  return `${getRandomItem(ADJECTIVES)} ${getRandomItem(NOUNS)}`;
}

/** 닉네임 로컬 저장/로드 */
const NICK_KEY = 'pixel-stonks-nickname';

export function loadNickname(): string {
  const saved = localStorage.getItem(NICK_KEY);
  if (saved) return saved;
  const nick = generateNickname();
  localStorage.setItem(NICK_KEY, nick);
  return nick;
}

export function saveNickname(nick: string): void {
  localStorage.setItem(NICK_KEY, nick);
}
