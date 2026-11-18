// Pushes tracker progress + Pro status to the widget extension through the
// shared App Group (UserDefaults). Nothing leaves the device.
import { Platform } from 'react-native';
import { APP_GROUP } from './config';
import type { TrackerSummary } from './tracker';
import type { ThemeId } from './themes';

export function syncWidget(summary: TrackerSummary, pro: boolean, theme: ThemeId): void {
  if (Platform.OS !== 'ios') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ExtensionStorage } = require('@bacons/apple-targets') as typeof import('@bacons/apple-targets');
    const s = new ExtensionStorage(APP_GROUP);
    s.set('percent', summary.percent);
    s.set('done', summary.done);
    s.set('total', summary.total);
    s.set('tracked', summary.tracked);
    s.set('pro', pro ? 1 : 0);
    s.set('theme', theme);
    ExtensionStorage.reloadWidget();
  } catch {
    /* widget extension not present (web / dev) — ignore */
  }
}
