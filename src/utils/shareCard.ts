// 결과 카드를 캔버스로 합성 → PNG Blob
// 토스 인앱/카카오 등 어디서든 이미지 첨부로 공유 가능

interface ShareCardData {
  profitRate: number;
  tierLabel: string;
  characterName: string;
  scenarioName: string;
  nickname: string | null;
  isChallenge: boolean;
}

const W = 600;
const H = 800;

export async function buildShareCard(
  data: ShareCardData,
  spriteSrc: string,
  tierSpriteSrc: string,
): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 배경: 톤 결정 (이익=따뜻한 핑크, 손실=차가운 블루, 폭망=다크)
  const profit = data.profitRate;
  let bgTop = '#fdf6e3';
  let bgBot = '#f5e6c8';
  let textMain = '#1a1a2e';
  let accent = '#d63031';
  if (profit < -10) {
    bgTop = '#1a1a2e';
    bgBot = '#2d1b3d';
    textMain = '#fafafa';
    accent = '#ff4444';
  } else if (profit < 0) {
    bgTop = '#eef3f9';
    bgBot = '#dde8f4';
    accent = '#1a6bce';
  } else if (profit < 10) {
    bgTop = '#faf8f4';
    bgBot = '#f0ebe3';
    accent = '#27ae60';
  }

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, bgTop);
  grad.addColorStop(1, bgBot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 외곽 픽셀 보더
  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  ctx.strokeRect(12, 12, W - 24, H - 24);

  // 상단 브랜드
  ctx.fillStyle = textMain;
  ctx.textAlign = 'center';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('픽셀단타왕', W / 2, 80);
  ctx.font = '14px monospace';
  ctx.fillStyle = profit < -10 ? '#999' : '#888';
  ctx.fillText('PIXEL STONKS · 30초 단타', W / 2, 110);

  if (data.isChallenge) {
    ctx.fillStyle = '#f39c12';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('★ 오늘의 챌린지', W / 2, 140);
  }

  // 캐릭터 스프라이트 + 티어 스프라이트
  const [charImg, tierImg] = await Promise.all([
    loadImage(spriteSrc),
    loadImage(tierSpriteSrc),
  ]);

  if (charImg) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(charImg, W / 2 - 120, 180, 80, 80);
  }
  if (tierImg) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tierImg, W / 2 + 40, 180, 80, 80);
  }

  // 수익률 (가장 큼)
  const sign = profit >= 0 ? '+' : '';
  ctx.fillStyle = accent;
  ctx.textAlign = 'center';
  ctx.font = 'bold 96px monospace';
  ctx.fillText(`${sign}${profit.toFixed(1)}%`, W / 2, 400);

  // 티어 라벨
  ctx.fillStyle = textMain;
  ctx.font = 'bold 32px sans-serif';
  ctx.fillText(data.tierLabel, W / 2, 470);

  // 종목 / 패턴 (패턴은 결과화면에선 숨겼지만 카드엔 회고 OK)
  ctx.fillStyle = profit < -10 ? '#aaa' : '#666';
  ctx.font = '18px sans-serif';
  ctx.fillText(`${data.characterName} · ${data.scenarioName}`, W / 2, 530);

  // 닉네임
  if (data.nickname) {
    ctx.fillStyle = textMain;
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(data.nickname, W / 2, 600);
  }

  // 푸터: 도전 권유
  ctx.fillStyle = profit < -10 ? '#888' : '#999';
  ctx.font = '14px monospace';
  ctx.fillText('당신도 30초 안에 수익 낼 수 있나요?', W / 2, H - 60);

  return await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * 카드를 공유한다. 가능하면 Web Share API로 이미지 첨부, 안 되면 다운로드 폴백.
 */
export async function shareCard(blob: Blob, text: string): Promise<'shared' | 'downloaded' | 'failed'> {
  const file = new File([blob], 'pixel-stonks.png', { type: 'image/png' });

  // 1. Web Share API (이미지 첨부 가능한지 체크)
  const navAny = navigator as Navigator & {
    canShare?: (data: { files?: File[] }) => boolean;
    share?: (data: { files?: File[]; text?: string; title?: string }) => Promise<void>;
  };
  if (navAny.canShare?.({ files: [file] }) && navAny.share) {
    try {
      await navAny.share({ files: [file], text, title: '픽셀단타왕' });
      return 'shared';
    } catch (e) {
      // 사용자 취소는 정상, 그 외는 폴백
      if ((e as Error).name === 'AbortError') return 'shared';
    }
  }

  // 2. 폴백: 다운로드
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pixel-stonks.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}
