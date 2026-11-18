// The 1080×1920 share card (rendered at 360×640 points, captured at 3×).
// Original gradients and text only — no third-party art or logos.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { CardTheme } from './themes';

export interface CardContent {
  kicker: string;
  big: string;
  unit: string;
  sub: string;
  footnote: string;
  percent?: number; // progress bar when set
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ShareCard = ({ theme: t, content: c, cardRef }: { theme: CardTheme; content: CardContent; cardRef: React.Ref<any> }) => (
  <View ref={cardRef} collapsable={false} style={styles.frame}>
    <LinearGradient colors={t.bg} style={StyleSheet.absoluteFill} />
    <View style={[styles.border, { borderColor: t.accent[1] }]} />
    <View style={styles.content}>
      <Text style={[styles.word, { color: t.text }]}>
        COUNTDOWN <Text style={{ color: t.accent[0] }}>VI</Text>
      </Text>
      <Text style={[styles.kicker, { color: t.muted }]}>{c.kicker}</Text>
      <Text style={[styles.big, { color: t.text }]} adjustsFontSizeToFit numberOfLines={1}>{c.big}</Text>
      <Text style={[styles.unit, { color: t.text }]}>{c.unit}</Text>
      {typeof c.percent === 'number' ? (
        <View style={styles.track}>
          <LinearGradient colors={t.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.fill, { width: `${Math.max(0, Math.min(100, c.percent))}%` }]} />
        </View>
      ) : null}
      <Text style={[styles.sub, { color: t.sub }]}>{c.sub}</Text>
      <View style={{ flex: 1 }} />
      <Text style={[styles.foot, { color: t.text }]}>{c.footnote}</Text>
      <Text style={[styles.fine, { color: t.muted }]}>Get Countdown VI on the App Store · Unofficial fan app</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  frame: { width: 360, height: 640, overflow: 'hidden', backgroundColor: '#000' },
  border: { position: 'absolute', top: 12, left: 12, right: 12, bottom: 12, borderRadius: 18, borderWidth: 2 },
  content: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', paddingTop: 48, paddingBottom: 40, paddingHorizontal: 28 },
  word: { fontSize: 26, fontWeight: '800', letterSpacing: 3 },
  kicker: { marginTop: 40, fontSize: 14, fontWeight: '700', letterSpacing: 5 },
  big: { marginTop: 12, fontSize: 150, fontWeight: '900', lineHeight: 170 },
  unit: { fontSize: 26, fontWeight: '800', letterSpacing: 6 },
  track: { marginTop: 22, width: '86%', height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
  sub: { marginTop: 18, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  foot: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  fine: { marginTop: 8, fontSize: 11, textAlign: 'center' },
});
