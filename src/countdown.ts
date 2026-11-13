// Countdown VI — pure countdown + timeline logic. No DOM, no dates from the
// network: everything derives from the LAUNCH_LOCAL constant in config.ts
// and the clock passed in, so it is fully unit-testable.

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Milliseconds remaining; <= 0 once launched. */
  remainingMs: number;
  /** True once the launch moment has been reached. */
  launched: boolean;
}

export function getCountdown(target: Date, now: Date): CountdownParts {
  const remainingMs = target.getTime() - now.getTime();
  const launched = remainingMs <= 0;
  const clamped = Math.max(0, remainingMs);
  const totalSeconds = Math.floor(clamped / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor(totalSeconds / 3600) % 24,
    minutes: Math.floor(totalSeconds / 60) % 60,
    seconds: totalSeconds % 60,
    remainingMs,
    launched,
  };
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export type MilestoneStatus = 'done' | 'today' | 'upcoming';

export interface MilestoneState {
  status: MilestoneStatus;
  /** Short status label shown on the timeline card. */
  label: string;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** A milestone is done once its day has fully passed, "today" on its day. */
export function getMilestoneStatus(milestoneDate: Date, now: Date): MilestoneState {
  const m = startOfDay(milestoneDate).getTime();
  const n = startOfDay(now).getTime();
  if (n > m) return { status: 'done', label: 'Done' };
  if (n === m) return { status: 'today', label: 'Today' };
  return { status: 'upcoming', label: 'Coming up' };
}
