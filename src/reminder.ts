// Countdown VI — pure launch-night reminder logic. No DOM, no plugin calls,
// no direct localStorage access: persistence goes through a StorageLike
// passed in, and main.ts owns the @capacitor/local-notifications calls, so
// everything here is fully unit-testable.
//
// The reminder fires 5 minutes before launch: Nov 18, 2026, 11:55 PM local
// time. It is a LOCAL notification — no server, no account, nothing leaves
// the device.

import { LAUNCH_LOCAL } from './config.ts';
import type { StorageLike } from './checklist.ts';

export const REMINDER_STORAGE_KEY = 'cvi.reminder';
export const REMINDER_NOTIFICATION_ID = 1;
export const REMINDER_MINUTES_BEFORE_LAUNCH = 5;
export const REMINDER_TITLE = 'Launch in 5 minutes';
export const REMINDER_BODY = 'The wait is almost over — the game unlocks at midnight.';

/** The moment the reminder fires: launch minus 5 minutes, local time. */
export function getReminderTime(): Date {
  return new Date(LAUNCH_LOCAL.getTime() - REMINDER_MINUTES_BEFORE_LAUNCH * 60 * 1000);
}

/** True once the reminder moment has passed (too late to set it). */
export function isReminderTimePassed(now: Date): boolean {
  return now.getTime() >= getReminderTime().getTime();
}

/** Stored toggle state: 'on' means the user enabled the reminder. */
export function loadReminderOn(storage: StorageLike): boolean {
  try {
    return storage.getItem(REMINDER_STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
}

export function saveReminderOn(storage: StorageLike, on: boolean): void {
  try {
    storage.setItem(REMINDER_STORAGE_KEY, on ? 'on' : 'off');
  } catch {
    /* storage unavailable — the choice just won't persist */
  }
}
