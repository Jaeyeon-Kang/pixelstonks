import { useEffect, useRef, useState } from 'react';
import type { GameState, ProfitTier } from '../types';
import { submitScore } from '../services/leaderboard';
import { GAME_CONFIG } from '../config/gameConfig';

interface ResultScreenProps {
  state: GameState;
  onRestart: () => void;
  onHome: () => void;
  onRanking: () => void;
}

function getTier(profitRate: number): ProfitTier {
  if (profitRate >= 50) return 'god';
  if (profitRate >= 30) return 'legend';
  if (profitRate >= 20) return 'pro';
  if (profitRate >= 10) return 'beast';
  if (profitRate >= 5) return 'good';
  if (profitRate >= 2) return 'okay';
  if (profitRate >= -2) return 'meh';
  if (profitRate >= -5) return 'sad';
  if (profitRate >= -10) return 'cry';
  if (profitRate >= -20) return 'dead';
  if (profitRate >= -40) return 'doom';
  return 'hell';
}

const TIER_INFO: Record<ProfitTier, { label: string; sprite: string }> = {
  god:    { label: '버그 아님?', sprite: '/sprites/tier_god.svg' },
  legend: { label: '전설의 단타왕', sprite: '/sprites/tier_legend.svg' },
  pro:    { label: '프로 개미', sprite: '/sprites/tier_pro.svg' },
  beast:  { label: '야수의 심장', sprite: '/sprites/tier_beast.svg' },
  good:   { label: '쏠쏠한 수익', sprite: '/sprites/tier_good.svg' },
  okay:   { label: '용돈 벌이', sprite: '/sprites/tier_okay.svg' },
  meh:    { label: '본전치기', sprite: '/sprites/tier_meh.svg' },
  sad:    { label: '개미의 눈물', sprite: '/sprites/tier_sad.svg' },
  cry:    { label: '물린 개미', sprite: '/sprites/tier_cry.svg' },
  dead:   { label: '깡통계좌', sprite: '/sprites/tier_dead.svg' },
  doom:   { label: '반대매매', sprite: '/sprites/tier_doom.svg' },
  hell:   { label: '상장폐지', sprite: '/sprites/tier_hell.svg' },
};

const MEME_POOL: Record<ProfitTier, string[]> = {
  god: [
    '금감원 선생님, 저는 진짜 아무것도 모릅니다',
    '이 정도면 내부자 거래 빼박. 철고랑 엔딩',
    '검찰청 출석 요구서 날아오기 전에 튄다',
    '작전세력으로 오해받기 딱 좋은 미친 타점',
    '삐용삐용... 문 밖에서 경찰 사이렌 소리 들림',
    '저 진짜 작전주 세력 아닙니다. 믿어주세요',
  ],
  legend: [
    '30초 만에 1년 치 운을 다 끌어다 썼네',
    '수익률 실화? 모의투자 앱인 줄 알았음',
    '내 손가락이 빚어낸 30초의 기적',
    '이건 차트가 아니라 예술 작품이다',
    '수익률이 미쳐 날뜁니다. 심장 터질 뻔',
    '계좌에 찍힌 숫자가 안 믿겨서 새로고침 중',
  ],
  pro: [
    '감정 없는 매매 머신. 그것이 바로 나',
    '호가창의 흐름을 완벽하게 읽어낸 자',
    '스캘핑의 정석. 교과서에 실려도 됨',
    '군더더기 없는 완벽한 칼매수 칼매도',
    '차트의 맥박을 정확히 짚어냈습니다',
    '뇌동매매 금지. 오직 기계적인 타점만',
  ],
  beast: [
    '야수의 심장으로 버텨낸 달콤한 결과물',
    '롤러코스터 맨 앞자리 탑승 완료',
    '심장은 쫄렸지만 내 손가락은 흔들리지 않았다',
    '사실 오줌 지릴 뻔했는데 티 안 낸 거임',
    '풀매수 때린 내 강심장에 건배',
    '이 구역의 야수가 바로 나다',
  ],
  good: [
    '오늘 저녁은 소고기 말고 돼지고기 굽는다',
    '수익금으로 당당하게 마라탕 시켜 먹음',
    '치킨값 벌었으면 훌륭한 30초지',
    '스타벅스 가서 벤티 사이즈 긁는다',
    '국밥 3그릇 뚝딱. 가성비 최고',
    '택시 타고 퇴근해도 되는 날',
  ],
  okay: [
    '안 잃었으면 된 거 아님? 방어력 만렙',
    '은행 이자보다 낫잖아. (현실 부정 중)',
    '수수료 떼고 커피 한 잔 값 남았네',
    '원금 지켰으니 오늘 매매는 성공적',
    '파란불 안 본 걸로 위안 삼는다',
    '워렌 버핏 명언 1조 1항 준수 완료',
  ],
  meh: [
    '숨만 쉬었는데 수수료로 돈이 삭제됨',
    '증권사 좋은 일만 실컷 시켜준 30초',
    '샀다 팔았다... 남은 건 마우스 혹사뿐',
    '전기세랑 시간만 날린 완벽한 헛수고',
    '내 계좌는 시계추인가? 왜 제자리걸음이지',
    '제로섬 게임의 처참한 예시',
  ],
  sad: [
    '내가 사니까 귀신같이 내리는 마법의 계좌',
    '내가 팔면 오르고 사면 내리는 과학',
    '완벽한 고점 판독기. 틀리는 법이 없음',
    '모니터 거꾸로 보면 수익률 빨간색임',
    '가벼운 찰과상. 빨간약 바르면 낫겠지',
    '차트가 나를 대놓고 비웃는 기분이다',
  ],
  cry: [
    '어차피 안 팔면 손해 아님. 장기투자 시작',
    '지금 물타기 하면 구조대 오나요?',
    '여기서 손절해? 아니면 눈 꼭 감고 버텨?',
    '물타기 계속하다가 대주주 되게 생겼음',
    '내 계좌에 파란 비가 내려와',
    '존버가 답인가... 아닌가... 모르겠다',
  ],
  dead: [
    '바닥인 줄 알았는데 그 밑에 지하실이 있네',
    '지하실 뚫고 맨틀까지 직행하는 중',
    '숨이 안 쉬어져요. 구급차 좀 불러주세요',
    '30초 만에 시드 반토막. 마술쇼 폼 미쳤다',
    '멘탈 붕괴. 심전도 차트 삐-------',
    '깡통계좌 속성 입문. 세계 신기록',
  ],
  doom: [
    '가족한테는 무조건 비밀이다. 호적 파임',
    '매수 버튼 누른 내 손가락을 원망해',
    '반대매매 30초 체험판. 뼛속까지 시림',
    '어이가 없어서 그냥 헛웃음만 나옴 ㅋㅋㅋ',
    '원금 회복? 다음 생에 다시 도전합니다',
    '손절 타이밍? 진작에 지나갔습니다',
  ],
  hell: [
    '주식으로 1억 만드는 법: 2억을 넣는다',
    '상장폐지의 화려한 불꽃으로 장렬히 산화',
    '삭제된 계좌입니다. 정보를 찾을 수 없습니다',
    '돈을 길바닥에 뿌리는 게 덜 억울할 듯',
    '마이너스가 실제로 존재하는 숫자였구나',
    '워렌 버핏이 와도 이 계좌는 심폐소생 불가',
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const IDLE_MEMES = [
  '매수 버튼 고장 난 거 아님. 굳은 의지임',
  '현금 비중 100% 유지. 방어력 1티어',
  '팝콘 뜯으며 남들 털리는 거 직관 중',
  '쫄아서 안 산 거 아님. 아무튼 아님',
  '안 산 게 수익이다... 근데 왜 눈물이 나지',
  '윈도우 화면 보호기 30초 잘 감상했습니다',
];

export function ResultScreen({ state, onRestart, onHome, onRanking }: ResultScreenProps) {
  const profitRate = state.finalProfitRate ?? 0;
  // 한 번도 매수하지 않았는지 체크 (매매권 3개 그대로)
  const neverBought = state.tradesLeft === GAME_CONFIG.maxTrades;
  const tier = neverBought ? 'meh' as ProfitTier : getTier(profitRate);
  const tierInfo = neverBought ? { label: '구경만 함', sprite: '/sprites/tier_idle.svg' } : TIER_INFO[tier];
  const memeRef = useRef(neverBought ? pickRandom(IDLE_MEMES) : pickRandom(MEME_POOL[tier]));
  const profitClass = profitRate >= 0 ? 'profit-positive' : 'profit-negative';
  const profitSign = profitRate >= 0 ? '+' : '';

  const pnl = Math.round(GAME_CONFIG.initialPrice * profitRate / 100);
  const pnlSign = pnl >= 0 ? '+' : '';
  const finalBalance = GAME_CONFIG.initialPrice + pnl;

  const [myRank, setMyRank] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current) return;
    if (!state.character || !state.scenario) return;
    submitted.current = true;
    setSubmitting(true);
    submitScore(profitRate, state.character.id, state.scenario.id)
      .then(({ rank }) => setMyRank(rank))
      .finally(() => setSubmitting(false));
  }, [profitRate, state.character, state.scenario]);

  // 티어별 무드 분류
  const tierMood = (() => {
    if (neverBought) return 'idle';
    if (['god', 'legend', 'pro'].includes(tier)) return 'gold';
    if (['beast', 'good'].includes(tier)) return 'win';
    if (['okay', 'meh'].includes(tier)) return 'neutral';
    if (['sad', 'cry'].includes(tier)) return 'lose';
    return 'doom'; // dead, doom, hell
  })();

  return (
    <div className={`result result-mood-${tierMood}`}>
      {/* 결과 카드 */}
      <div className={`result-card pixel-panel rc-${tierMood}`}>
        {/* 상단: 캐릭터 + 판정 */}
        <div className="result-header">
          <img src={state.character?.sprite} alt={state.character?.name} className="result-char-sprite" draggable={false} />
          <span className={`result-verdict rv-${tierMood}`}>
            {neverBought ? '관망...' : profitRate > 0 ? '승리!' : profitRate === 0 ? '본전' : '패배...'}
          </span>
        </div>

        {/* 수익률 */}
        <div className={`result-rate ${profitClass} rate-anim-${profitRate > 0 ? 'win' : profitRate < 0 ? 'lose' : 'neutral'}`}>
          {profitSign}{profitRate.toFixed(1)}%
        </div>

        {/* 잔액 */}
        <div className="result-pnl">
          <span className="result-pnl-label">최종 잔액</span>
          <span className={`result-pnl-amount ${profitClass}`}>
            {finalBalance.toLocaleString()}P ({pnlSign}{pnl.toLocaleString()}P)
          </span>
        </div>

        {/* 등급 아이콘 (크게!) */}
        <div className={`result-tier-box tb-${tierMood}`}>
          <img src={tierInfo.sprite} alt={tierInfo.label} className="result-tier-sprite" draggable={false} />
          <span className="result-tier-label">{tierInfo.label}</span>
        </div>

        {/* 밈 말풍선 */}
        <div className={`result-meme-bubble mb-${tierMood}`}>
          <span className="meme-quote">"</span>
          {memeRef.current}
          <span className="meme-quote">"</span>
        </div>

        {/* 메타 */}
        <div className="result-meta">
          <span>종목: {state.character?.name}</span>
          <span>패턴: {state.scenario?.nameKo}</span>
        </div>

        {submitting && <div className="result-loading">순위 집계 중...</div>}
        {myRank !== null && (
          <div className="result-rank" onClick={onRanking}>
            <span>오늘의 순위</span>
            <span className="result-rank-num">#{myRank}</span>
            <span className="result-rank-go">{'>'} 랭킹</span>
          </div>
        )}
      </div>

      {/* 버튼 */}
      <div className="result-actions">
        <button className="btn-retro btn-pixel result-retry" onClick={onRestart}>
          다시하기
        </button>
        <button className="btn-retro btn-sub result-home-btn" onClick={onHome}>홈으로</button>
      </div>

      <style>{`
        .result {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 16px;
          transition: background 0.3s;
        }

        /* ===== 배경 무드 ===== */
        .result-mood-gold { background: linear-gradient(180deg, #fdf6e3 0%, #f5e6c8 100%); }
        .result-mood-win  { background: linear-gradient(180deg, #fdf2f2 0%, #f5e8e8 100%); }
        .result-mood-neutral { background: var(--bg); }
        .result-mood-lose { background: linear-gradient(180deg, #eef3f9 0%, #dde8f4 100%); }
        .result-mood-doom { background: linear-gradient(180deg, #1a1a2e 0%, #2d1b3d 100%); }
        .result-mood-idle { background: var(--bg); }

        /* doom 모드에서 텍스트 밝게 */
        .result-mood-doom .result-meta,
        .result-mood-doom .result-pnl-label,
        .result-mood-doom .result-rank { color: #999; }
        .result-mood-doom .result-rank-go { color: #777; }

        /* ===== 카드 ===== */
        .result-card {
          width: 100%;
          max-width: 320px;
          padding: 18px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 8px;
          animation: cardReveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes cardReveal {
          0% { transform: scale(0.8) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        /* 카드 테두리 glow */
        .rc-gold { border-color: #d4a90a; box-shadow: 0 0 20px rgba(241,196,15,0.3), 0 0 40px rgba(241,196,15,0.1); }
        .rc-win  { border-color: #d63031; box-shadow: 0 0 12px rgba(214,48,49,0.15); }
        .rc-neutral { }
        .rc-lose { border-color: #4a90e2; box-shadow: 0 0 12px rgba(74,144,226,0.15); }
        .rc-doom { border-color: #a02525; background: #1e1e2e; box-shadow: 0 0 20px rgba(160,37,37,0.3), inset 0 0 30px rgba(160,37,37,0.05); }
        .rc-idle { }

        /* ===== 상단 헤더 ===== */
        .result-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .result-char-sprite {
          width: 48px;
          height: 48px;
          image-rendering: pixelated;
          animation: charBounce 0.6s ease-out 0.2s both;
        }
        @keyframes charBounce {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .result-verdict {
          font-size: 16px;
          font-weight: bold;
        }
        .rv-gold { color: #b8860b; }
        .rv-win  { color: var(--profit); }
        .rv-neutral { color: var(--text); }
        .rv-lose { color: var(--loss); }
        .rv-doom { color: #ff4444; text-shadow: 0 0 8px rgba(255,68,68,0.5); }
        .rv-idle { color: var(--text-sub); }

        /* ===== 수익률 ===== */
        .result-rate {
          font-family: var(--font-en);
          font-size: 38px;
          line-height: 1.2;
          font-weight: bold;
        }
        .rate-anim-win {
          animation: rateGlow 1.5s ease-in-out infinite;
        }
        .rate-anim-lose {
          animation: rateShake 0.5s ease-in-out 0.3s;
        }
        @keyframes rateGlow {
          0%, 100% { text-shadow: none; }
          50% { text-shadow: 0 0 12px rgba(214,48,49,0.4); }
        }
        @keyframes rateShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }

        /* doom 모드 수익률 */
        .result-mood-doom .result-rate {
          color: #ff4444;
          text-shadow: 0 0 10px rgba(255,68,68,0.6);
        }

        /* ===== 잔액 ===== */
        .result-pnl {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .result-pnl-label {
          font-size: 10px;
          color: var(--muted);
        }
        .result-pnl-amount {
          font-family: var(--font-en);
          font-size: 13px;
        }

        /* ===== 등급 아이콘 박스 ===== */
        .result-tier-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 0;
          margin: 4px 0;
          border-radius: 8px;
        }
        .result-tier-sprite {
          width: 56px;
          height: 56px;
          image-rendering: pixelated;
          animation: tierPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both;
        }
        @keyframes tierPop {
          0% { transform: scale(0) rotate(-15deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(3deg); }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        .result-tier-label {
          font-size: 15px;
          font-weight: bold;
          letter-spacing: 1px;
        }

        /* 티어 박스 색상 */
        .tb-gold {
          background: linear-gradient(135deg, rgba(241,196,15,0.12) 0%, rgba(212,169,10,0.08) 100%);
          border: 1px dashed rgba(241,196,15,0.3);
        }
        .tb-gold .result-tier-label { color: #b8860b; }
        .tb-gold .result-tier-sprite { animation: tierPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.4s both, goldShine 2s ease-in-out 1s infinite; }
        @keyframes goldShine {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.3) drop-shadow(0 0 6px rgba(241,196,15,0.5)); }
        }

        .tb-win {
          background: rgba(214,48,49,0.06);
          border: 1px dashed rgba(214,48,49,0.2);
        }
        .tb-win .result-tier-label { color: var(--profit); }

        .tb-neutral {
          background: rgba(0,0,0,0.02);
          border: 1px dashed var(--border);
        }
        .tb-neutral .result-tier-label { color: var(--text-sub); }

        .tb-lose {
          background: rgba(74,144,226,0.06);
          border: 1px dashed rgba(74,144,226,0.2);
        }
        .tb-lose .result-tier-label { color: var(--loss); }

        .tb-doom {
          background: rgba(160,37,37,0.15);
          border: 1px dashed rgba(255,68,68,0.3);
          animation: doomPulse 1.5s ease-in-out infinite;
        }
        .tb-doom .result-tier-label { color: #ff6666; text-shadow: 0 0 6px rgba(255,68,68,0.4); }
        @keyframes doomPulse {
          0%, 100% { box-shadow: inset 0 0 0 transparent; }
          50% { box-shadow: inset 0 0 15px rgba(255,68,68,0.1); }
        }

        .tb-idle {
          background: rgba(0,0,0,0.02);
          border: 1px dashed var(--border);
        }
        .tb-idle .result-tier-label { color: var(--text-sub); }

        /* ===== 밈 말풍선 ===== */
        .result-meme-bubble {
          position: relative;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.6;
          animation: memeSlide 0.4s ease-out 0.6s both;
        }
        @keyframes memeSlide {
          0% { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .meme-quote {
          font-size: 16px;
          font-weight: bold;
          opacity: 0.3;
          vertical-align: -1px;
        }

        .mb-gold { background: rgba(241,196,15,0.08); color: #8b6914; }
        .mb-win  { background: rgba(214,48,49,0.05); color: var(--text-sub); }
        .mb-neutral { background: rgba(0,0,0,0.03); color: var(--text-sub); }
        .mb-lose { background: rgba(74,144,226,0.05); color: var(--text-sub); }
        .mb-doom { background: rgba(255,68,68,0.08); color: #cc9999; }
        .mb-idle { background: rgba(0,0,0,0.03); color: var(--text-sub); }

        /* ===== 메타 ===== */
        .result-meta {
          font-size: 11px;
          color: var(--text-sub);
          display: flex;
          justify-content: center;
          gap: 14px;
        }
        .result-loading {
          font-size: 10px;
          color: var(--muted);
          animation: blink 1s infinite;
        }
        .result-rank {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 8px 14px;
          background: rgba(243,156,18,0.08);
          border: 1px solid rgba(243,156,18,0.2);
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          color: var(--text-sub);
        }
        .result-rank:active { background: rgba(243,156,18,0.15); }
        .result-rank-num {
          font-family: var(--font-en);
          font-size: 18px;
          color: var(--accent);
        }
        .result-rank-go {
          font-family: var(--font-en);
          font-size: 9px;
          color: var(--muted);
        }

        /* doom 모드 랭킹 카드 */
        .result-mood-doom .result-rank {
          background: rgba(255,68,68,0.08);
          border-color: rgba(255,68,68,0.2);
        }
        .result-mood-doom .result-rank-num { color: #ff6666; }

        /* ===== 버튼 ===== */
        .result-actions {
          width: 100%;
          max-width: 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .result-retry {
          width: 100%;
          height: 48px;
          font-size: 14px;
          letter-spacing: 2px;
        }
        .result-home-btn {
          height: 36px;
          width: 120px;
          font-size: 12px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
