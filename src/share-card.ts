// Countdown VI — shareable countdown card. Renders a 1080×1920 PNG on a
// canvas in the app's own neon style (original art only — gradients, shapes,
// text; no Rockstar assets, no "GTA" in the image text), then shares it:
// native share sheet on iOS via @capacitor/share (+ @capacitor/filesystem),
// Web Share API with files where the browser supports it, otherwise a PNG
// download. Nothing leaves the device except through the share the user
// chose.

import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { LAUNCH_LABEL } from './config.ts';
import type { CountdownParts } from './countdown.ts';

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1920;
export const CARD_FILENAME = 'countdown-vi.png';

export interface ShareNumbers {
  /** The big number on the card (days, or hours when under a day). */
  big: string;
  bigUnit: string;
  /** The smaller line under it. */
  sub: string;
}

/** Picks the numbers the card shows. Pure — unit-tested. */
export function getShareNumbers(cd: CountdownParts): ShareNumbers {
  if (cd.launched) return { big: '0', bigUnit: 'DAYS', sub: 'The game is out now' };
  if (cd.days > 0) {
    return {
      big: String(cd.days),
      bigUnit: cd.days === 1 ? 'DAY' : 'DAYS',
      sub: `${cd.hours} hour${cd.hours === 1 ? '' : 's'} · ${cd.minutes} minute${cd.minutes === 1 ? '' : 's'} to go`,
    };
  }
  return {
    big: String(cd.hours),
    bigUnit: cd.hours === 1 ? 'HOUR' : 'HOURS',
    sub: `${cd.minutes} minute${cd.minutes === 1 ? '' : 's'} · ${cd.seconds} second${cd.seconds === 1 ? '' : 's'} to go`,
  };
}

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

function setLetterSpacing(ctx: CanvasRenderingContext2D, px: string): void {
  try {
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = px;
  } catch {
    /* older canvases ignore letter-spacing — the layout still works */
  }
}

/** Draws the card onto `canvas` (sized to CARD_WIDTH × CARD_HEIGHT). */
export function drawShareCard(canvas: HTMLCanvasElement, cd: CountdownParts): void {
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const cx = CARD_WIDTH / 2;
  const nums = getShareNumbers(cd);

  // Background: dark vertical gradient.
  const bg = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
  bg.addColorStop(0, '#0b0b14');
  bg.addColorStop(0.55, '#141428');
  bg.addColorStop(1, '#1b1030');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Soft neon glows (pink top-right, teal bottom-left).
  const glowPink = ctx.createRadialGradient(980, 180, 0, 980, 180, 620);
  glowPink.addColorStop(0, 'rgba(255, 46, 136, 0.28)');
  glowPink.addColorStop(1, 'rgba(255, 46, 136, 0)');
  ctx.fillStyle = glowPink;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  const glowTeal = ctx.createRadialGradient(100, 1740, 0, 100, 1740, 620);
  glowTeal.addColorStop(0, 'rgba(0, 229, 199, 0.22)');
  glowTeal.addColorStop(1, 'rgba(0, 229, 199, 0)');
  ctx.fillStyle = glowTeal;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Gradient border.
  const border = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  border.addColorStop(0, '#ff2e88');
  border.addColorStop(0.5, '#7c5cff');
  border.addColorStop(1, '#00e5c7');
  ctx.strokeStyle = border;
  ctx.lineWidth = 6;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(36, 36, CARD_WIDTH - 72, CARD_HEIGHT - 72, 48);
  else ctx.rect(36, 36, CARD_WIDTH - 72, CARD_HEIGHT - 72);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Wordmark: COUNTDOWN (white) + VI (gradient).
  ctx.font = `800 88px ${FONT}`;
  setLetterSpacing(ctx, '10px');
  const countW = ctx.measureText('COUNTDOWN ').width;
  const viW = ctx.measureText('VI').width;
  const wordX = cx - (countW + viW) / 2;
  ctx.fillStyle = '#f2f2f8';
  ctx.textAlign = 'left';
  ctx.fillText('COUNTDOWN ', wordX, 190);
  const viGrad = ctx.createLinearGradient(wordX + countW, 0, wordX + countW + viW, 0);
  viGrad.addColorStop(0, '#ff2e88');
  viGrad.addColorStop(0.5, '#7c5cff');
  viGrad.addColorStop(1, '#00e5c7');
  ctx.fillStyle = viGrad;
  ctx.fillText('VI', wordX + countW, 190);
  ctx.textAlign = 'center';

  // UNTIL LAUNCH kicker.
  ctx.font = `700 44px ${FONT}`;
  setLetterSpacing(ctx, '16px');
  ctx.fillStyle = '#a7a7bd';
  ctx.fillText('UNTIL LAUNCH', cx, 300);

  // The big number.
  const bigGrad = ctx.createLinearGradient(0, 420, 0, 940);
  bigGrad.addColorStop(0, '#ffffff');
  bigGrad.addColorStop(0.55, '#ffb3d1');
  bigGrad.addColorStop(1, '#ff2e88');
  ctx.font = `900 480px ${FONT}`;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = bigGrad;
  ctx.fillText(nums.big, cx, 700);

  // Unit + sub line.
  ctx.font = `800 76px ${FONT}`;
  setLetterSpacing(ctx, '20px');
  ctx.fillStyle = '#f2f2f8';
  ctx.fillText(nums.bigUnit, cx, 1000);
  ctx.font = `600 52px ${FONT}`;
  setLetterSpacing(ctx, '0px');
  ctx.fillStyle = '#00e5c7';
  ctx.fillText(nums.sub, cx, 1100);

  // Divider.
  const divGrad = ctx.createLinearGradient(cx - 280, 0, cx + 280, 0);
  divGrad.addColorStop(0, 'rgba(255, 46, 136, 0)');
  divGrad.addColorStop(0.5, '#7c5cff');
  divGrad.addColorStop(1, 'rgba(0, 229, 199, 0)');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 280, 1240);
  ctx.lineTo(cx + 280, 1240);
  ctx.stroke();

  // Launch date.
  ctx.font = `800 62px ${FONT}`;
  ctx.fillStyle = '#f2f2f8';
  ctx.fillText(LAUNCH_LABEL, cx, 1340);
  ctx.font = `600 46px ${FONT}`;
  ctx.fillStyle = '#a7a7bd';
  ctx.fillText('Midnight local time', cx, 1420);

  // Footer.
  ctx.font = `800 48px ${FONT}`;
  ctx.fillStyle = '#f2f2f8';
  ctx.fillText('Get Countdown VI on the App Store', cx, 1700);
  ctx.font = `400 34px ${FONT}`;
  ctx.fillStyle = '#a7a7bd';
  ctx.fillText('Unofficial fan app', cx, 1780);
}

export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled' | 'failed';

function isCancelError(e: unknown): boolean {
  if (e instanceof DOMException && e.name === 'AbortError') return true;
  const msg = e instanceof Error ? e.message : String(e);
  return /cancel|abort|dismissed/i.test(msg);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Renders the card and shares it. Native: writes the PNG to the cache and
 * opens the iOS share sheet. Web: Web Share API with files where supported,
 * otherwise downloads the PNG. Never throws — always resolves to an outcome.
 */
export async function shareCountdownCard(cd: CountdownParts): Promise<ShareOutcome> {
  try {
    const canvas = document.createElement('canvas');
    drawShareCard(canvas, cd);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return 'failed';

    if (Capacitor.isNativePlatform()) {
      try {
        const base64 = await blobToBase64(blob);
        const file = await Filesystem.writeFile({
          path: CARD_FILENAME,
          data: base64,
          directory: Directory.Cache,
        });
        await Share.share({
          title: 'Countdown VI',
          text: 'Counting down to November 19, 2026 — midnight local time.',
          files: [file.uri],
          dialogTitle: 'Share countdown',
        });
        return 'shared';
      } catch (e) {
        return isCancelError(e) ? 'cancelled' : 'failed';
      }
    }

    // Web: prefer the Web Share API with files, fall back to download.
    try {
      const file = new File([blob], CARD_FILENAME, { type: 'image/png' });
      if (
        typeof navigator.share === 'function' &&
        (typeof navigator.canShare !== 'function' || navigator.canShare({ files: [file] }))
      ) {
        await navigator.share({
          files: [file],
          title: 'Countdown VI',
          text: 'Counting down to November 19, 2026 — midnight local time.',
        });
        return 'shared';
      }
    } catch (e) {
      if (isCancelError(e)) return 'cancelled';
      // Any other web-share failure falls through to the download.
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = CARD_FILENAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
    return 'downloaded';
  } catch {
    return 'failed';
  }
}
