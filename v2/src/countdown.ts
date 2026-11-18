export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  launched: boolean;
}

export function getCountdown(target: Date, now: Date): CountdownParts {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, launched: true };
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor(s / 3600) % 24,
    minutes: Math.floor(s / 60) % 60,
    seconds: s % 60,
    launched: false,
  };
}

export const pad2 = (n: number): string => String(n).padStart(2, '0');
