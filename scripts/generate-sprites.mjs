import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUT = join(import.meta.dirname, '..', 'public', 'sprites');
mkdirSync(OUT, { recursive: true });

// 색상 팔레트
const C = {
  '.': null,           // 투명
  'K': '#1a1a2e',      // 검정 (외곽선)
  'W': '#ffffff',      // 흰색
  'w': '#e8e8e8',      // 밝은 회색
  'g': '#95a5a6',      // 회색
  'G': '#27ae60',      // 초록
  'd': '#1e8449',      // 진초록
  'B': '#4a90e2',      // 파랑
  'b': '#2c6cb5',      // 진파랑
  'R': '#d63031',      // 빨강
  'r': '#a02525',      // 진빨강
  'Y': '#f1c40f',      // 노랑
  'y': '#d4a90a',      // 진노랑
  'O': '#e67e22',      // 주황
  'o': '#c06818',      // 진주황
  'P': '#9b59b6',      // 보라
  'p': '#7d3c98',      // 진보라
  'S': '#bdc3c7',      // 실버
  's': '#7f8c8d',      // 진실버
  'F': '#f5d6a8',      // 살구색
  'f': '#e8c08a',      // 진살구색
  'L': '#5dade2',      // 하늘색
  'l': '#3498db',      // 진하늘색
  'C': '#1abc9c',      // 시안
  'c': '#16a085',      // 진시안
};

// ==========================================
// 종목 캐릭터 5종 (16x16, 정확히 16칸)
// ==========================================

// 삼송전기 - 스마트폰 (파란 화면에 눈, 홈버튼)
const samsong = [
  '....KKKKKKKK....',
  '...KssssssssK...',
  '...KsKKKKKKsK...',
  '...KsBBBBBBsK...',
  '...KsBBBBBBsK...',
  '...KsBWKBWKsK...',
  '...KsBBBBBBsK...',
  '...KsBBbbBBsK...',
  '...KsBBBBBBsK...',
  '...KsBBBBBBsK...',
  '...KsBBBBBBsK...',
  '...KsKKKKKKsK...',
  '...KssKWWKssK...',
  '...KssssssssK...',
  '....KKKKKKKK....',
  '................',
];

// 테슬러모터스 - 자동차 (옆면, 바퀴 2개)
const teslur = [
  '................',
  '................',
  '......KKKK......',
  '....KKRRRRK.....',
  '...KRRRRRRRK....',
  '..KRLLKLLKRrK...',
  '..KRRRRRRRRrK...',
  '.KKRRRRRRRRrKK..',
  '.KRRRRRRRRRrRK..',
  '.KRRRRRRRRRRrK..',
  '.KKKKKKKKKKKKKK..',
  '.KKsKK.KK.KKsKK.',
  '..KsK........KsK.',
  '..KKK........KKK.',
  '................',
  '................',
];

// 겜스톱 - 컨트롤러 (넓은 패드, 십자키+버튼)
const gemstop = [
  '................',
  '................',
  '..KKKKKKKKKKKK..',
  '.KPPPPPPPPPPPpK.',
  '.KPPWKPPPWKPPpK.',
  '.KPPPPPPPPPPPpK.',
  '.KPPPKpKPPPPPpK.',
  '.KPKPPPKPPRPPpK.',
  '.KPPPKpKPPPPPpK.',
  '.KPPPPPPPPBPPpK.',
  '..KPPPPPPPPPpK..',
  '...KPPPPPPPpK...',
  '...KKKKKKKKKKK...',
  '................',
  '................',
  '................',
];

// 루나코잉 - 동전 (원형, ₩마크, 눈)
const lunacoing = [
  '................',
  '.....KKKKKK.....',
  '...KKYYYYYyKK...',
  '..KYYYYYYYYYyK..',
  '..KYYWKYYWKYyK..',
  '..KYYYYYYYYYyK..',
  '..KYYYKyyKYYyK..',
  '..KYYYYYYYYYyK..',
  '..KYYYYYYYYYyK..',
  '..KYYyKKKKyYyK..',
  '..KYYYYYYYYYyK..',
  '...KKYYYYYyKK...',
  '.....KKKKKK.....',
  '................',
  '................',
  '................',
];

// 엔비디오 - GPU칩 (정사각형, 핀, 초록)
const envidio = [
  '..K.K.K.K.K.K...',
  '..KKKKKKKKKKK...',
  '.KKGGGGGGGGgKK..',
  '.KGGGGGGGGGGgK..',
  '.KGGWKGGGWKGgK..',
  '.KGGGGGGGGGGgK..',
  '.KGGGGddGGGGgK..',
  '.KGGGKddKGGGgK..',
  '.KGGGGGGGGGGgK..',
  '.KGGGGGGGGGGgK..',
  '.KKGGGGGGGGgKK..',
  '..KKKKKKKKKKK...',
  '..K.K.K.K.K.K...',
  '................',
  '................',
  '................',
];

// ==========================================
// 등급 아이콘 13종 (16x16)
// ==========================================

// 👑 god - 왕관
const tier_god = [
  '................',
  '..K...K.K...K...',
  '..KY.KYK.YK....',
  '..KYYKYYKYYK....',
  '..KYYYYYYYYK....',
  '..KYYYYYYYYK....',
  '..KYYyYYyYYK....',
  '..KYYYYYYYYK....',
  '..KYYYYYYYYK....',
  '..KYYYYYYYYK....',
  '..KKKKKKKKKK....',
  '................',
  '................',
  '................',
  '................',
  '................',
];

// ★★★ legend - 큰 별
const tier_legend = [
  '................',
  '.......K........',
  '......KYK.......',
  '......KYK.......',
  '..KKKKYYYKKK....',
  '...KYYYYYYyK....',
  '....KYYYYyK.....',
  '...KYYYYYYyK....',
  '..KYyK..KYyK....',
  '..KK......KK....',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];

// ★★☆ pro - 메달
const tier_pro = [
  '................',
  '.....KKKK.......',
  '....KOOOoK......',
  '...KKKKKKKK.....',
  '....KYYYyK......',
  '...KYYYYYyK.....',
  '...KYYWYYyK.....',
  '...KYYYYYyK.....',
  '....KYYYyK......',
  '.....KKKK.......',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];

// ★★ beast - 불꽃 하트
const tier_beast = [
  '................',
  '..KKK...KKK....',
  '.KRRrK.KRRrK...',
  '.KRRRRKRRRRrK..',
  '.KRRRRRRRRRrK..',
  '..KRRRRRRRrK....',
  '...KRRRRRrK.....',
  '....KRRRrK......',
  '.....KRrK.......',
  '......KK........',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];

// ★ good - 엄지척
const tier_good = [
  '................',
  '........KK......',
  '.......KFFK.....',
  '......KFFFK.....',
  '......KFFFK.....',
  '..KKK.KFFFK.....',
  '.KFFFKKFFFK.....',
  '.KFFFFFFFK......',
  '.KFFFFFFFK......',
  '.KFFFFFFfK......',
  '..KKKKKKfK......',
  '.....KKKfK......',
  '......KKKK......',
  '................',
  '................',
  '................',
];

// ☆ okay - 커피컵
const tier_okay = [
  '................',
  '....K...K.......',
  '.....K.K........',
  '....K...K.......',
  '...KKKKKKKK.....',
  '...KwwwwwwK.....',
  '...KwwwwwwKKK...',
  '...KwwwwwwK.K...',
  '...KwwwwwwKKK...',
  '...KwwwwwwK.....',
  '...KKKKKKKK.....',
  '..KKSSSSSSKK....',
  '..KKKKKKKKKKK...',
  '................',
  '................',
  '................',
];

// - meh - 무표정
const tier_meh = [
  '................',
  '.....KKKKKK.....',
  '...KKYYYYYyKK...',
  '..KYYYYYYYYYyK..',
  '..KYYKKYKKYYyK..',
  '..KYYYYYYYYYyK..',
  '..KYYYYYYYYYyK..',
  '..KYYKKKKKYYyK..',
  '..KYYYYYYYYYyK..',
  '...KKYYYYYyKK...',
  '.....KKKKKK.....',
  '................',
  '................',
  '................',
  '................',
  '................',
];

// ▼ sad - 땀 흘리는 얼굴
const tier_sad = [
  '................',
  '.....KKKKKK.....',
  '...KKYYYYYyKK...',
  '..KYYYYYYYYYyK..',
  '..KYYKKYKKYY yK..',
  '..KYYYYYYYYYyK..',
  '..KYYYYYYYYYyK..',
  '..KYYYKyKYYYyK..',
  '..KYYKYYYKYYyK..',
  '...KKYYYYYyKK...',
  '.....KKKKKK.....',
  '..........KB....',
  '...........K....',
  '................',
  '................',
  '................',
];

// ▼▼ cry - 울먹
const tier_cry = [
  '................',
  '.....KKKKKK.....',
  '...KKYYYYYyKK...',
  '..KYYYYYYYYYyK..',
  '..KYKKYYYKKYyK..',
  '..KYYBYYYBYYyK..',
  '..KYYBYYYBYYyK..',
  '..KYYYYYYYYYyK..',
  '..KYYYKKKYYYyK..',
  '...KKYYYYYyKK...',
  '.....KKKKKK.....',
  '................',
  '................',
  '................',
  '................',
  '................',
];

// ▼▼▼ dead - 해골
const tier_dead = [
  '................',
  '.....KKKKKK.....',
  '...KKWWWWWwKK...',
  '..KWWWWWWWWWwK..',
  '..KWKKWWKKWWwK..',
  '..KWKKWWKKWWwK..',
  '..KWWWWWWWWWwK..',
  '..KWWWKWKWWWwK..',
  '..KWWKWKWKWWwK..',
  '...KKWWWWWwKK...',
  '.....KKKKKK.....',
  '................',
  '................',
  '................',
  '................',
  '................',
];

// 💀 doom - 깨진 해골
const tier_doom = [
  '................',
  '.....KKKKKK.....',
  '...KKWWK.WwKK...',
  '..KWWWWKWWWWwK..',
  '..KWKKWWKKWWwK..',
  '..KWKKWWKKWWwK..',
  '..KWWWWWWWWWwK..',
  '..KWWWKWKWWWwK..',
  '..KWWKWKWKWWwK..',
  '...KKWWWWWwKK...',
  '.....KKKKKK.....',
  '................',
  '................',
  '................',
  '................',
  '................',
];

// 🔥 hell - 불꽃
const tier_hell = [
  '................',
  '.......KK.......',
  '..K...KRRK......',
  '..KR.KRRRrK.....',
  '..KRKRRRRRRK....',
  '..KRRRRYRRrK....',
  '...KRRYYYRrK....',
  '...KRRYYYRrK....',
  '...KRRRYRRrK....',
  '...KRRRRRRrK....',
  '....KRRRRrK.....',
  '.....KRRrK......',
  '......KKK.......',
  '................',
  '................',
  '................',
];

// 👀 idle - 눈
const tier_idle = [
  '................',
  '................',
  '................',
  '...KKKK.KKKK....',
  '..KWWWwKWWWwK...',
  '..KWWKwKWWKwK...',
  '..KWWKwKWWKwK...',
  '..KWWWwKWWWwK...',
  '...KKKK.KKKK....',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];

function toSvg(pixels, size = 16) {
  let rects = '';
  for (let y = 0; y < pixels.length; y++) {
    const row = pixels[y];
    for (let x = 0; x < Math.min(row.length, size); x++) {
      const ch = row[x];
      const color = C[ch];
      if (!color) continue;
      rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size * 2}" height="${size * 2}" shape-rendering="crispEdges">${rects}</svg>`;
}

// 카카못 - 주황 말풍선 (카카오 패러디, 꼬리 달린 말풍선)
const kakamot = [
  '................',
  '....KKKKKKKK....',
  '...KOOOOOOOoK...',
  '..KOOOOOOOOOoK..',
  '..KOOWKOOWKOoK..',
  '..KOOOOOOOOOoK..',
  '..KOOOOOOOOOoK..',
  '..KOOKOooOKOoK..',
  '..KOOOOOOOOOoK..',
  '...KOOOOOOOoK...',
  '....KKKKKKKoK...',
  '..........KoK...',
  '...........KK...',
  '................',
  '................',
  '................',
];

// 한놔에어 - 시안 로켓 (한화에어 패러디, 불꽃 분사)
const hannwa = [
  '.......KK.......',
  '......KCCK......',
  '.....KCCCcK.....',
  '.....KCCCcK.....',
  '....KCCCCCcK....',
  '....KCWKWKcK....',
  '....KCCCCCcK....',
  '....KCCccCcK....',
  '...KCCCCCCCcK...',
  '..KKCCCCCCCcKK..',
  '.KK.KCCCCCcK.KK.',
  '....KCCCCCcK....',
  '.....KKKKKcK....',
  '.....KRRRrK.....',
  '......KRrK......',
  '.......KK.......',
];

// 크랩톤 - 하늘색 게이밍 모니터 (크래프톤 패러디)
const crapton = [
  '................',
  '.KKKKKKKKKKKK...',
  '.KLLLLLLLLLlK...',
  '.KLLLLLLLLLlK...',
  '.KLLWKLLWKLlK...',
  '.KLLLLLLLLLlK...',
  '.KLLLLllLLLlK...',
  '.KLLLLLLLLLlK...',
  '.KKKKKKKKKKKK...',
  '......KssK......',
  '......KssK......',
  '...KKKKKKKKKK...',
  '...KssssssssK...',
  '...KKKKKKKKKK...',
  '................',
  '................',
];

// 쿠빵 - 실버 택배상자 (쿠팡 패러디, 주황 테이프)
const kupang = [
  '................',
  '..KKKKKKKKKKKK..',
  '..KSSSSSSSSSsK..',
  '..KSSSSSSSSSsK..',
  '..KSSWKSSWKSsK..',
  '..KSSSSSSSSSsK..',
  '..KSSSKsKSSSsK..',
  '..KSSSSSSSSSsK..',
  '..KKKKKKKKKKKK..',
  '..KSSOOOOOSSsK..',
  '..KSSOOOOOSSsK..',
  '..KSSSSSSSSSsK..',
  '..KKKKKKKKKKKK..',
  '................',
  '................',
  '................',
];

// 종목 캐릭터
const chars = { samsong, teslur, gemstop, lunacoing, envidio, kakamot, hannwa, crapton, kupang };
for (const [name, data] of Object.entries(chars)) {
  writeFileSync(join(OUT, `${name}.svg`), toSvg(data));
  console.log(`✓ char: ${name}.svg`);
}

// 등급 아이콘
const tiers = {
  tier_god, tier_legend, tier_pro, tier_beast,
  tier_good, tier_okay, tier_meh, tier_sad,
  tier_cry, tier_dead, tier_doom, tier_hell, tier_idle,
};
for (const [name, data] of Object.entries(tiers)) {
  writeFileSync(join(OUT, `${name}.svg`), toSvg(data));
  console.log(`✓ ${name}.svg`);
}

console.log('Done!');
