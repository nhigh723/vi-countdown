// Countdown VI v2 — native rebuild (Expo). Free core: countdown / launch
// mode, store links, 100% tracker (six generic categories + 1 custom),
// home-screen widget, Neon share cards. Pro (one-time, StoreKit): unlimited
// custom trackers, four extra card + widget styles, lock-screen widgets,
// Founder badge. No ads, no account, no analytics.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import {
  APP_VERSION,
  DISCLAIMER,
  LAUNCH_LABEL,
  LAUNCH_LOCAL,
  NEWS_LINKS,
  PRIVACY_URL,
  PRO_NAME,
  STORE_LINKS,
} from './src/config';
import { getCountdown, pad2 } from './src/countdown';
import {
  FREE_CUSTOM_LIMIT,
  MAX_NAME_LENGTH,
  addCustom,
  bump,
  canAddCustom,
  dayNumber,
  loadTracker,
  removeCustom,
  saveTracker,
  setTotal,
  summarize,
  type TrackerCategory,
} from './src/tracker';
import {
  PREMIUM_THEMES,
  THEMES,
  THEME_ORDER,
  getCountdownNumbers,
  getProgressNumbers,
  resolveTheme,
  type ThemeId,
} from './src/themes';
import { hydrate, storage } from './src/persist';
import { buyPro, initStore, listenForPro, restorePro } from './src/iap';
import { syncWidget } from './src/widgetSync';
import { ShareCard, type CardContent } from './src/ShareCard';

type Tab = 'home' | 'tracker' | 'pro' | 'about';
const C = { bg: '#0b0b14', surface: '#151522', surface2: '#1c1c2e', text: '#f2f2f8', muted: '#a7a7bd', pink: '#ff2e88', teal: '#00e5c7', purple: '#7c5cff', line: '#26263a', green: '#34d399' };

function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}

function Root() {
  const now = useNow();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('home');
  const [tracker, setTracker] = useState<TrackerCategory[]>([]);
  const [themeId, setThemeId] = useState<ThemeId>('neon');
  const [pro, setPro] = useState(false);
  const [price, setPrice] = useState<string | null>(null);
  const [storeAvailable, setStoreAvailable] = useState(false);
  const [busy, setBusy] = useState<'' | 'buy' | 'restore' | 'share'>('');
  const [proStatus, setProStatus] = useState('');
  const [card, setCard] = useState<CardContent | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cardRef = useRef<any>(null);

  const markPro = useCallback((v: boolean) => {
    setPro(v);
    storage.setItem('cvi.pro', v ? '1' : '0');
  }, []);

  useEffect(() => {
    let unsub: () => void = () => {};
    (async () => {
      await hydrate();
      setTracker(loadTracker(storage));
      const t = storage.getItem('cvi.theme');
      if (t && (THEME_ORDER as string[]).includes(t)) setThemeId(t as ThemeId);
      setPro(storage.getItem('cvi.pro') === '1');
      setReady(true);
      const st = await initStore();
      setPrice(st.price);
      setStoreAvailable(st.available);
      // Only upgrade from a refresh; a failed/empty check never locks out a
      // buyer (Restore writes the definitive answer either way).
      if (st.owned === true) markPro(true);
      unsub = await listenForPro(() => markPro(true));
    })();
    return () => unsub();
  }, [markPro]);

  const summary = useMemo(() => summarize(tracker), [tracker]);
  const theme = resolveTheme(themeId, pro);
  const launched = now.getTime() >= LAUNCH_LOCAL.getTime();
  const day = dayNumber(LAUNCH_LOCAL, now);

  useEffect(() => {
    if (ready) syncWidget(summary, pro, theme.id);
  }, [ready, summary, pro, theme.id]);

  const updateTracker = (next: TrackerCategory[]) => {
    setTracker(next);
    saveTracker(storage, next);
  };

  const shareCard = async (content: CardContent) => {
    setBusy('share');
    setCard(content);
    await new Promise((r) => setTimeout(r, 120)); // let the card lay out
    try {
      const uri = await captureRef(cardRef, { format: 'png', quality: 1, width: 1080, height: 1920 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share', UTI: 'public.png' });
      }
    } catch {
      Alert.alert('Couldn’t make the card', 'Please try again.');
    } finally {
      setBusy('');
      setCard(null);
    }
  };

  const shareCountdown = () => {
    const n = getCountdownNumbers(getCountdown(LAUNCH_LOCAL, new Date()));
    void shareCard({ kicker: launched ? `DAY ${day}` : 'UNTIL LAUNCH', big: n.big, unit: n.unit, sub: n.sub, footnote: LAUNCH_LABEL });
  };
  const shareProgress = () => {
    const n = getProgressNumbers(summary, day);
    void shareCard({ kicker: n.kicker, big: n.big, unit: 'COMPLETE', sub: n.sub, footnote: 'Tracked with Countdown VI', percent: summary.percent });
  };

  const onBuy = async () => {
    setBusy('buy');
    setProStatus('Contacting the App Store…');
    const r = await buyPro();
    setBusy('');
    if (r === 'purchased') {
      markPro(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setProStatus('Welcome, Founder — Pro is unlocked.');
    } else {
      setProStatus(
        r === 'cancelled'
          ? ''
          : r === 'pending'
            ? 'Waiting for approval. Pro unlocks automatically once it’s approved.'
            : r === 'unavailable'
              ? 'Purchases aren’t available right now. Please try again later.'
              : 'The purchase didn’t complete. If you were charged, tap Restore Purchases.',
      );
    }
  };
  const onRestore = async () => {
    setBusy('restore');
    setProStatus('Checking your purchases…');
    const r = await restorePro();
    setBusy('');
    if (r === 'restored') markPro(true);
    if (r === 'nothing') markPro(false);
    setProStatus(
      r === 'restored'
        ? 'Welcome back — Pro is unlocked.'
        : r === 'nothing'
          ? 'No Pro purchase found for this Apple ID.'
          : 'Couldn’t check your purchases. Check your connection and try again.',
    );
  };

  if (!ready) {
    return (
      <View style={[styles.fill, styles.center]}>
        <ActivityIndicator color={C.pink} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.fill} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.wordmark}>
          COUNTDOWN <Text style={{ color: C.pink }}>VI</Text>
        </Text>
        {pro ? <Text style={styles.founder}>★ FOUNDER</Text> : <Text style={styles.tagline}>Unofficial fan companion</Text>}
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {tab === 'home' && (
          <HomeTab now={now} launched={launched} day={day} percent={summary.tracked ? summary.percent : null} onShare={shareCountdown} sharing={busy === 'share'} goTracker={() => setTab('tracker')} />
        )}
        {tab === 'tracker' && (
          <TrackerTab
            tracker={tracker}
            pro={pro}
            themeId={theme.id}
            onChange={updateTracker}
            onTheme={(id) => {
              if (PREMIUM_THEMES.has(id) && !pro) {
                setTab('pro');
                return;
              }
              setThemeId(id);
              storage.setItem('cvi.theme', id);
            }}
            onNeedPro={() => setTab('pro')}
            onShare={shareProgress}
            sharing={busy === 'share'}
          />
        )}
        {tab === 'pro' && (
          <ProTab pro={pro} price={price} storeAvailable={storeAvailable} busy={busy} status={proStatus} onBuy={onBuy} onRestore={onRestore} />
        )}
        {tab === 'about' && <AboutTab onRestore={onRestore} busy={busy} status={proStatus} />}
      </ScrollView>
      <TabBar tab={tab} onTab={setTab} />
      {card ? (
        <View style={styles.offscreen} pointerEvents="none">
          <ShareCard cardRef={cardRef} theme={theme} content={card} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function Card({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return <View style={[styles.card, highlight && { borderColor: C.purple }]}>{children}</View>;
}

function Btn({ label, onPress, kind = 'primary', disabled, testID }: { label: string; onPress: () => void; kind?: 'primary' | 'ghost'; disabled?: boolean; testID?: string }) {
  return (
    <Pressable testID={testID} accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.btn, kind === 'ghost' ? styles.btnGhost : styles.btnPrimary, (pressed || disabled) && { opacity: 0.6 }]}>
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

function Bar({ percent }: { percent: number }) {
  return (
    <View style={styles.track}>
      <LinearGradient colors={[C.pink, C.purple, C.teal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: '100%', width: `${Math.max(0, Math.min(100, percent))}%`, borderRadius: 999 }} />
    </View>
  );
}

function HomeTab({ now, launched, day, percent, onShare, sharing, goTracker }: { now: Date; launched: boolean; day: number; percent: number | null; onShare: () => void; sharing: boolean; goTracker: () => void }) {
  const cd = getCountdown(LAUNCH_LOCAL, now);
  return (
    <>
      <Card>
        {launched ? (
          <View style={styles.center}>
            <Text style={styles.kicker}>DAY {day} SINCE LAUNCH</Text>
            <Text style={styles.outNow}>IT’S OUT NOW</Text>
            <Text style={styles.muted}>Out on PlayStation 5 and Xbox Series X|S since {LAUNCH_LABEL}.</Text>
          </View>
        ) : (
          <View style={styles.center}>
            <Text style={styles.kicker}>UNTIL LAUNCH</Text>
            <View style={styles.tiles}>
              {[
                [String(cd.days), 'Days'],
                [pad2(cd.hours), 'Hours'],
                [pad2(cd.minutes), 'Mins'],
                [pad2(cd.seconds), 'Secs'],
              ].map(([n, l]) => (
                <View key={l} style={styles.tile}>
                  <Text style={styles.tileNum}>{n}</Text>
                  <Text style={styles.tileLabel}>{l}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.muted}>{LAUNCH_LABEL} · Midnight local time</Text>
          </View>
        )}
        <View style={{ height: 12 }} />
        <Btn label={sharing ? 'Making your card…' : 'Share card ↗'} kind="ghost" onPress={onShare} disabled={sharing} />
      </Card>
      <Card highlight>
        <Text style={styles.h2}>Your 100% run</Text>
        {percent === null ? (
          <Text style={styles.muted}>Set your own goals and tick things off as you play. Saved on this iPhone only.</Text>
        ) : (
          <>
            <Text style={styles.big}>{percent}% complete</Text>
            <Bar percent={percent} />
          </>
        )}
        <Btn label="Open tracker" onPress={goTracker} />
      </Card>
      <Card>
        <Text style={styles.h2}>Get the game</Text>
        {STORE_LINKS.map((s) => (
          <Btn key={s.id} label={`${s.label} ↗`} kind="ghost" onPress={() => void Linking.openURL(s.url)} />
        ))}
        <Text style={styles.small}>Opens the official store page in your browser.</Text>
      </Card>
      <Card>
        <Text style={styles.h2}>Widgets</Text>
        <Text style={styles.muted}>Add Countdown VI to your Home Screen: touch and hold an empty spot, tap Edit → Add Widget, then search “Countdown VI”. It shows your 100% progress and day count.</Text>
      </Card>
    </>
  );
}

function TrackerTab({ tracker, pro, themeId, onChange, onTheme, onNeedPro, onShare, sharing }: { tracker: TrackerCategory[]; pro: boolean; themeId: ThemeId; onChange: (t: TrackerCategory[]) => void; onTheme: (id: ThemeId) => void; onNeedPro: () => void; onShare: () => void; sharing: boolean }) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [msg, setMsg] = useState('');
  const sum = summarize(tracker);
  const add = () => {
    const r = addCustom(tracker, name, goal || '0', pro);
    if (r.ok) {
      onChange(r.cats);
      setName('');
      setGoal('');
      setMsg('Added.');
      return;
    }
    if (r.reason === 'needs-pass') {
      setMsg(`Free includes ${FREE_CUSTOM_LIMIT} custom tracker. Pro unlocks unlimited.`);
      onNeedPro();
      return;
    }
    setMsg(r.reason === 'empty-name' ? 'Give it a name first.' : r.reason === 'duplicate' ? 'You already have a tracker with that name.' : 'That’s the maximum number of trackers.');
  };
  return (
    <>
      <Card>
        <Text style={styles.h2}>Your 100% tracker</Text>
        <Text style={styles.muted}>Set your own goals, then tap + as you play. Saved on this iPhone — no account, nothing uploaded.</Text>
        <Text style={[styles.big, { marginTop: 10 }]}>
          {sum.tracked === 0 ? 'Set a goal on any category to start.' : sum.percent >= 100 ? `100% — all ${sum.tracked} complete` : `${sum.percent}% · ${sum.done} of ${sum.total}`}
        </Text>
        <Bar percent={sum.percent} />
      </Card>
      {tracker.map((c) => {
        const pct = c.total > 0 ? Math.floor((Math.min(c.done, c.total) / c.total) * 100) : 0;
        const done = c.total > 0 && c.done >= c.total;
        return (
          <View key={c.id} style={[styles.row, done && { borderColor: C.green }]}>
            <View style={styles.rowTop}>
              <Text style={styles.rowName}>
                {c.name}
                {c.custom ? <Text style={styles.tag}>  YOURS</Text> : null}
              </Text>
              <Text style={[styles.count, done && { color: C.green }]}>{c.total > 0 ? `${c.done} / ${c.total}` : 'No goal yet'}</Text>
            </View>
            <Bar percent={pct} />
            <View style={styles.controls}>
              <Pressable accessibilityLabel={`One less ${c.name}`} style={[styles.step, c.done <= 0 && { opacity: 0.35 }]} disabled={c.done <= 0} onPress={() => { onChange(bump(tracker, c.id, -1)); void Haptics.selectionAsync(); }}>
                <Text style={styles.stepText}>−</Text>
              </Pressable>
              <Pressable accessibilityLabel={`One more ${c.name}`} style={[styles.step, { borderColor: C.purple }, (c.total <= 0 || done) && { opacity: 0.35 }]} disabled={c.total <= 0 || done} onPress={() => { const n = bump(tracker, c.id, 1); onChange(n); void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                <Text style={styles.stepText}>+</Text>
              </Pressable>
              <View style={{ flex: 1 }} />
              <Text style={styles.small}>Goal </Text>
              <GoalInput name={c.name} total={c.total} onCommit={(v) => onChange(setTotal(tracker, c.id, v))} />
              {c.custom ? (
                <Pressable accessibilityLabel={`Remove ${c.name}`} onPress={() => onChange(removeCustom(tracker, c.id))} style={styles.remove}>
                  <Text style={{ color: C.pink, fontWeight: '700' }}>Remove</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      })}
      <Card>
        <Text style={styles.h3}>Add your own</Text>
        <Text style={styles.small}>Anything you want to finish — name it and set a goal.{pro ? '' : ` Free includes ${FREE_CUSTOM_LIMIT}; Pro adds unlimited.`}</Text>
        <View style={styles.addRow}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="e.g. Races won" placeholderTextColor={C.muted} value={name} onChangeText={setName} maxLength={MAX_NAME_LENGTH} />
          <TextInput style={[styles.input, { width: 72 }]} placeholder="Goal" placeholderTextColor={C.muted} keyboardType="number-pad" value={goal} onChangeText={setGoal} />
        </View>
        <Btn label={canAddCustom(tracker, pro) ? 'Add' : 'Add (Pro) 🔒'} onPress={add} />
        {msg ? <Text style={styles.small}>{msg}</Text> : null}
      </Card>
      <Card>
        <Text style={styles.h3}>Share your progress</Text>
        <View style={styles.themes}>
          {THEME_ORDER.map((id) => {
            const t = THEMES[id];
            const locked = PREMIUM_THEMES.has(id) && !pro;
            return (
              <Pressable key={id} accessibilityLabel={`${t.label} style${locked ? ', Pro' : ''}`} onPress={() => onTheme(id)} style={[styles.theme, id === themeId && styles.themeActive, locked && { opacity: 0.55 }]}>
                <LinearGradient colors={t.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                <Text style={styles.themeText}>{t.label}{locked ? ' 🔒' : ''}</Text>
              </Pressable>
            );
          })}
        </View>
        <Btn label={sharing ? 'Making your card…' : 'Share progress card ↗'} kind="ghost" onPress={onShare} disabled={sharing} />
      </Card>
    </>
  );
}

function GoalInput({ name, total, onCommit }: { name: string; total: number; onCommit: (v: string) => void }) {
  const [v, setV] = useState(String(total));
  useEffect(() => setV(String(total)), [total]);
  const commit = () => {
    if (v.trim() === '' || v === String(total)) {
      setV(String(total));
      return;
    }
    onCommit(v);
  };
  return (
    <TextInput
      accessibilityLabel={`Goal for ${name}`}
      style={styles.goal}
      keyboardType="number-pad"
      value={v}
      onChangeText={(t) => setV(t.replace(/[^0-9]/g, '').slice(0, 4))}
      onBlur={commit}
      onSubmitEditing={commit}
      returnKeyType="done"
    />
  );
}

function ProTab({ pro, price, storeAvailable, busy, status, onBuy, onRestore }: { pro: boolean; price: string | null; storeAvailable: boolean; busy: string; status: string; onBuy: () => void; onRestore: () => void }) {
  return (
    <Card highlight>
      <Text style={styles.h2}>{PRO_NAME}</Text>
      {pro ? <Text style={[styles.big, { color: C.green }]}>★ You’re a Founder — Pro is active.</Text> : <Text style={styles.muted}>Optional. Everything else stays free, with no ads.</Text>}
      {[
        ['Unlimited custom trackers', `Add as many of your own categories as you like (free: six built-in + ${FREE_CUSTOM_LIMIT} of your own).`],
        ['Lock Screen widgets', 'Your 100% progress and day count right on your Lock Screen.'],
        ['Four extra styles', 'Sunset, Ocean, Mono and Gold for your share cards and widgets.'],
        ['Founder badge', 'A ★ Founder badge in the app.'],
      ].map(([h, b]) => (
        <View key={h} style={{ marginTop: 10 }}>
          <Text style={styles.h3}>✓ {h}</Text>
          <Text style={styles.muted}>{b}</Text>
        </View>
      ))}
      {!pro ? (
        <>
          <Text style={[styles.small, { marginTop: 14 }]}>One-time purchase{price ? ` — ${price}` : ''}. No subscription, no renewals. Works on every iPhone signed in to your Apple ID.</Text>
          <Btn testID="buy-pro" label={busy === 'buy' ? 'Contacting the App Store…' : price ? `Unlock Pro — ${price}` : 'Unlock Pro'} onPress={onBuy} disabled={!storeAvailable || busy !== ''} />
          {!storeAvailable ? <Text style={styles.small}>{Platform.OS === 'ios' ? 'Connecting to the App Store… check your connection if this doesn’t change.' : 'Purchases are available in the iPhone app.'}</Text> : null}
        </>
      ) : null}
      <Btn testID="restore" label={busy === 'restore' ? 'Checking…' : 'Restore Purchases'} kind="ghost" onPress={onRestore} disabled={busy !== ''} />
      {status ? <Text style={styles.small}>{status}</Text> : null}
    </Card>
  );
}

function AboutTab({ onRestore, busy, status }: { onRestore: () => void; busy: string; status: string }) {
  return (
    <>
      <Card>
        <Text style={styles.h2}>About</Text>
        <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
        <Text style={styles.muted}>Countdown VI is an independent fan-made companion. It has no ads, no account and no analytics — your tracker lives only on this iPhone. Purchases are handled by Apple.</Text>
        <Text style={styles.muted}>The tracker ships no game data: category names are generic and every goal is one you set.</Text>
        <Btn label="Privacy policy ↗" kind="ghost" onPress={() => void Linking.openURL(PRIVACY_URL)} />
        <Btn label={busy === 'restore' ? 'Checking…' : 'Restore Purchases'} kind="ghost" onPress={onRestore} disabled={busy !== ''} />
        {status ? <Text style={styles.small}>{status}</Text> : null}
        <Text style={styles.small}>Version {APP_VERSION}</Text>
      </Card>
      <Card>
        <Text style={styles.h3}>Official news</Text>
        {NEWS_LINKS.map((n) => (
          <Btn key={n.url} label={`${n.title} ↗`} kind="ghost" onPress={() => void Linking.openURL(n.url)} />
        ))}
      </Card>
    </>
  );
}

function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  const tabs: [Tab, string, string][] = [
    ['home', '⏱', 'Home'],
    ['tracker', '✓', 'Tracker'],
    ['pro', '★', 'Pro'],
    ['about', 'ⓘ', 'About'],
  ];
  return (
    <SafeAreaView edges={['bottom']} style={styles.tabbar}>
      {tabs.map(([id, icon, label]) => (
        <Pressable key={id} accessibilityRole="tab" accessibilityState={{ selected: tab === id }} onPress={() => onTab(id)} style={styles.tabBtn}>
          <Text style={[styles.tabIcon, tab === id && { color: C.pink }]}>{icon}</Text>
          <Text style={[styles.tabLabel, tab === id && { color: C.text }]}>{label}</Text>
        </Pressable>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wordmark: { color: C.text, fontSize: 20, fontWeight: '800', letterSpacing: 3 },
  tagline: { color: C.muted, fontSize: 12 },
  founder: { color: '#f3d27a', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  scroll: { padding: 16, paddingBottom: 40, gap: 12 },
  card: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 16, gap: 8 },
  h2: { color: C.text, fontSize: 20, fontWeight: '800' },
  h3: { color: C.text, fontSize: 16, fontWeight: '700' },
  big: { color: C.text, fontSize: 18, fontWeight: '700' },
  muted: { color: C.muted, fontSize: 15, lineHeight: 21 },
  small: { color: C.muted, fontSize: 13, lineHeight: 18 },
  disclaimer: { color: C.text, fontSize: 14, fontWeight: '600' },
  kicker: { color: C.muted, fontSize: 13, fontWeight: '700', letterSpacing: 4, marginBottom: 10 },
  outNow: { color: C.text, fontSize: 40, fontWeight: '900', marginBottom: 6 },
  tiles: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  tile: { backgroundColor: C.surface2, borderRadius: 12, paddingVertical: 10, width: 72, alignItems: 'center' },
  tileNum: { color: C.text, fontSize: 30, fontWeight: '900', fontVariant: ['tabular-nums'] },
  tileLabel: { color: C.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  btnPrimary: { backgroundColor: C.pink },
  btnGhost: { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.line },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  track: { height: 8, borderRadius: 999, backgroundColor: C.surface2, overflow: 'hidden', marginVertical: 6 },
  row: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 12 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  rowName: { color: C.text, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  tag: { color: C.teal, fontSize: 11, fontWeight: '800' },
  count: { color: C.muted, fontVariant: ['tabular-nums'] },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  step: { width: 46, height: 46, borderRadius: 12, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: C.text, fontSize: 24, fontWeight: '800' },
  goal: { width: 72, minHeight: 44, borderRadius: 10, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, color: C.text, paddingHorizontal: 10, fontSize: 16 },
  remove: { paddingHorizontal: 6, paddingVertical: 12 },
  addRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  input: { minHeight: 46, borderRadius: 10, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, color: C.text, paddingHorizontal: 12, fontSize: 16 },
  themes: { flexDirection: 'row', gap: 6, marginVertical: 6 },
  theme: { flex: 1, height: 52, borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  themeActive: { borderColor: C.text },
  themeText: { color: '#fff', fontSize: 11, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 2 },
  tabbar: { flexDirection: 'row', backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.line },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabIcon: { color: C.muted, fontSize: 18 },
  tabLabel: { color: C.muted, fontSize: 11, fontWeight: '600', marginTop: 2 },
  offscreen: { position: 'absolute', left: -10000, top: 0 },
});
