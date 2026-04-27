import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing, Pressable, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import Svg, { Defs, LinearGradient, Stop, Rect, Polygon } from "react-native-svg";

import { useGame } from "../lib/store";
import { theme } from "../lib/theme";
import { applyLoss, applyWinReward, totalStats } from "../lib/game";
import { CHARACTER_ASSETS, characterIdFromSeed, petAssetFor, comboAssetFor } from "../lib/assets";
import type { BattleEvent } from "../lib/types";

export default function BattleScreen() {
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const router = useRouter();
  const player = useGame((s) => s.player);
  const last = useGame((s) => s.lastBattle);
  const opponents = useGame((s) => s.opponents);
  const selectedId = useGame((s) => s.selectedOpponentId);
  const updatePlayer = useGame((s) => s.updatePlayer);
  const refreshOpponents = useGame((s) => s.refreshOpponents);

  const opponent = opponents.find((o) => o.id === selectedId);

  const [eventIdx, setEventIdx] = useState(0);
  const [hp1, setHp1] = useState(0);
  const [hp2, setHp2] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [floatNumbers, setFloatNumbers] = useState<{ id: number; side: "p1" | "p2"; value: string; crit: boolean }[]>([]);
  const [logEntries, setLogEntries] = useState<string[]>([]);
  const [speedMul, setSpeedMul] = useState(1);
  const floatId = useRef(0);
  const rewardsApplied = useRef(false);

  const p1Shake = useRef(new Animated.Value(0)).current;
  const p2Shake = useRef(new Animated.Value(0)).current;

  const maxHp1 = player ? totalStats(player).hp : 1;
  const maxHp2 = opponent ? totalStats(opponent).hp : 1;

  useEffect(() => {
    if (!last || !opponent) return;
    setHp1(maxHp1);
    setHp2(maxHp2);
    setEventIdx(0);
    setShowResult(false);
    setLogEntries([]);
    rewardsApplied.current = false;
  }, [last?.events, opponent?.id]);

  useEffect(() => {
    if (!last) return;
    if (eventIdx >= last.events.length) return;
    const ev = last.events[eventIdx];

    const tick = setTimeout(() => {
      setHp1(ev.hp1After);
      setHp2(ev.hp2After);

      if (ev.t === "attack" || ev.t === "crit" || ev.t === "pet_attack") {
        const side = ev.target;
        const val = ev.damage ? `${ev.damage}` : "";
        const isCrit = ev.t === "crit";
        const id = ++floatId.current;
        setFloatNumbers((cur) => [...cur, { id, side, value: val, crit: isCrit }]);
        setTimeout(() => setFloatNumbers((cur) => cur.filter((f) => f.id !== id)), 800);
        const target = side === "p1" ? p1Shake : p2Shake;
        Animated.sequence([
          Animated.timing(target, { toValue: side === "p1" ? -8 : 8, duration: 60, useNativeDriver: true, easing: Easing.linear }),
          Animated.timing(target, { toValue: 0, duration: 100, useNativeDriver: true, easing: Easing.linear }),
        ]).start();
        const attackerName = ev.attacker === "p1" ? player.name : ev.attacker === "p2" ? opponent?.name : ev.attacker === "pet1" ? player.pet?.name ?? "Pet" : opponent?.pet?.name ?? "Pet";
        const targetName = side === "p1" ? player.name : opponent?.name;
        const verb = isCrit ? "lands a CRIT on" : "hits";
        setLogEntries((l) => [...l.slice(-3), `${attackerName} ${verb} ${targetName} for ${ev.damage}`]);
        if (isCrit) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } else if (ev.t === "dodge") {
        const id = ++floatId.current;
        setFloatNumbers((cur) => [...cur, { id, side: ev.target, value: "DODGE", crit: false }]);
        setTimeout(() => setFloatNumbers((cur) => cur.filter((f) => f.id !== id)), 700);
        const targetName = ev.target === "p1" ? player.name : opponent?.name;
        setLogEntries((l) => [...l.slice(-3), `${targetName} dodges!`]);
      } else if (ev.t === "end") {
        setShowResult(true);
        if (last.winner === "p1") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        if (!rewardsApplied.current && opponent) {
          rewardsApplied.current = true;
          if (last.winner === "p1") updatePlayer((p) => applyWinReward(p, opponent.level));
          else updatePlayer((p) => applyLoss(p));
        }
      }

      setEventIdx((i) => i + 1);
    }, eventDelay(ev) / speedMul);

    return () => clearTimeout(tick);
  }, [eventIdx, last, speedMul]);

  if (!last || !opponent) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>No active battle</Text>
        <Pressable style={styles.fallbackBtn} onPress={() => router.back()}>
          <Text style={styles.fightLabel}>BACK</Text>
        </Pressable>
      </View>
    );
  }

  const won = last.winner === "p1";
  const playerSrc = comboAssetFor(
    player.charClass ?? characterIdFromSeed(player.avatarSeed),
    player.equipment?.chest?.iconKey,
    player.equipment?.weapon?.iconKey,
  ) ?? CHARACTER_ASSETS[characterIdFromSeed(player.avatarSeed)];
  const oppSrc = comboAssetFor(
    opponent.charClass ?? characterIdFromSeed(opponent.avatarSeed),
    opponent.equipment?.chest?.iconKey,
    opponent.equipment?.weapon?.iconKey,
  ) ?? CHARACTER_ASSETS[characterIdFromSeed(opponent.avatarSeed)];

  // Available arena vertical space ≈ window - top inset - banners(~46) - hp(~24) - log(~70) - bottom inset.
  const arenaH = Math.max(140, winH - insets.top - insets.bottom - 46 - 24 - 70 - 16);
  const charSize = Math.min(190, Math.max(110, arenaH * 0.85));
  const petSize = charSize * 0.7;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <BambooBg />

      <View style={styles.topHeader}>
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerName} numberOfLines={1}>{player.name}</Text>
        </View>
        <View style={styles.crossWrap}>
          <Svg width={56} height={56}>
            <Defs>
              <LinearGradient id="cb" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#c44030" />
                <Stop offset="1" stopColor="#7a1810" />
              </LinearGradient>
            </Defs>
            <Polygon points="28,0 56,20 56,42 28,56 0,42 0,20" fill="url(#cb)" stroke="#3a0808" strokeWidth="2" />
          </Svg>
          <Text style={styles.crossX}>⚔</Text>
        </View>
        <View style={styles.bannerRight}>
          <Text style={[styles.bannerName, { textAlign: "right" }]} numberOfLines={1}>{opponent.name}</Text>
        </View>
      </View>

      <View style={styles.hpRow}>
        <HpBar current={hp1} max={maxHp1} side="left" />
        <View style={{ width: 56 }} />
        <HpBar current={hp2} max={maxHp2} side="right" />
      </View>

      <View style={styles.arena}>
        <View style={styles.fighterRow}>
          <Animated.View style={[styles.fighterLeft, { transform: [{ translateX: p1Shake }] }]}>
            {player.pet && petAssetFor(player.pet.id) && (
              <Image source={petAssetFor(player.pet.id)!} style={{ width: petSize, height: petSize, marginRight: -petSize * 0.18 }} contentFit="contain" />
            )}
            <Image source={playerSrc} style={{ width: charSize, height: charSize }} contentFit="contain" />
            {floatNumbers.filter(f => f.side === "p1").map(f => <FloatNum key={f.id} value={f.value} crit={f.crit} />)}
          </Animated.View>

          <Animated.View style={[styles.fighterRight, { transform: [{ translateX: p2Shake }] }]}>
            <Image source={oppSrc} style={{ width: charSize, height: charSize, transform: [{ scaleX: -1 }] }} contentFit="contain" />
            {opponent.pet && petAssetFor(opponent.pet.id) && (
              <Image source={petAssetFor(opponent.pet.id)!} style={{ width: petSize, height: petSize, marginLeft: -petSize * 0.18, transform: [{ scaleX: -1 }] }} contentFit="contain" />
            )}
            {floatNumbers.filter(f => f.side === "p2").map(f => <FloatNum key={f.id} value={f.value} crit={f.crit} />)}
          </Animated.View>
        </View>
      </View>

      <View style={[styles.logPanel, { marginBottom: insets.bottom + 8 }]}>
        <Text style={styles.logTitle}>BATTLE LOG</Text>
        {logEntries.slice(-3).map((line, i) => (
          <Text key={i} style={styles.logLine} numberOfLines={1}>• {line}</Text>
        ))}
      </View>

      <View style={[styles.bottomBtns, { bottom: insets.bottom + 8 }]}>
        <Pressable style={styles.controlBtn} onPress={() => setSpeedMul(speedMul === 1 ? 2 : speedMul === 2 ? 4 : 1)}>
          <Text style={styles.controlLabel}>{speedMul}×</Text>
        </Pressable>
        <Pressable style={styles.controlBtn} onPress={() => {
          if (!last) return;
          const lastEv = last.events[last.events.length - 1];
          setHp1(lastEv.hp1After);
          setHp2(lastEv.hp2After);
          setEventIdx(last.events.length);
          setShowResult(true);
          if (!rewardsApplied.current && opponent) {
            rewardsApplied.current = true;
            if (last.winner === "p1") updatePlayer((p) => applyWinReward(p, opponent.level));
            else updatePlayer((p) => applyLoss(p));
          }
        }}>
          <Text style={styles.controlLabel}>SKIP</Text>
        </Pressable>
      </View>

      {showResult && (
        <View style={styles.resultOverlay}>
          <View style={styles.resultPanel}>
            <Text style={[styles.resultTitle, { color: won ? "#3a8c3a" : "#a82820" }]}>
              {won ? "VICTORY!" : "DEFEAT"}
            </Text>
            <Text style={styles.resultSub}>vs {opponent.name} (Lv {opponent.level})</Text>
            {won ? (
              <Text style={styles.rewardText}>
                +{20 + opponent.level * 8} XP   +{50 + opponent.level * 12} 💰
              </Text>
            ) : (
              <Text style={styles.rewardText}>You lost {Math.min(player.gold, 10 + player.level * 2)} gold</Text>
            )}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Pressable style={styles.fightBtn} onPress={() => { refreshOpponents(); router.back(); }}>
                <Text style={styles.fightLabel}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function BambooBg() {
  return (
    <Svg style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#7da848" />
          <Stop offset="0.5" stopColor="#5a7a30" />
          <Stop offset="1" stopColor="#9c8350" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#sky)" />
      {Array.from({ length: 14 }).map((_, i) => (
        <Rect key={i} x={`${(i / 14) * 100}%`} y={0} width={5} height="80%" fill="#3a5820" opacity={0.55} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <Rect key={i} x={`${(i / 8) * 100 + 4}%`} y={0} width={3} height="80%" fill="#2d4515" opacity={0.5} />
      ))}
    </Svg>
  );
}

function HpBar({ current, max, side }: { current: number; max: number; side: "left" | "right" }) {
  const pct = Math.max(0, Math.min(1, current / Math.max(1, max)));
  return (
    <View style={[styles.hpBarOuter, side === "right" && { transform: [{ scaleX: -1 }] }]}>
      <View style={[styles.hpFill, { width: `${pct * 100}%` }]} />
      <View style={side === "right" ? { transform: [{ scaleX: -1 }] } : undefined}>
        <Text style={styles.hpLabel}>{current} / {max}</Text>
      </View>
    </View>
  );
}

function FloatNum({ value, crit }: { value: string; crit: boolean }) {
  const ty = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(ty, { toValue: -60, duration: 700, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.timing(op, { toValue: 0, duration: 700, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
    ]).start();
  }, []);
  return (
    <Animated.Text
      style={[
        styles.floatNum,
        crit && styles.floatCrit,
        value === "DODGE" && styles.floatDodge,
        { transform: [{ translateY: ty as any }], opacity: op as any },
      ]}
    >
      {value}
    </Animated.Text>
  );
}

function eventDelay(ev: BattleEvent): number {
  switch (ev.t) {
    case "start": return 250;
    case "attack": case "pet_attack": return 380;
    case "crit": return 500;
    case "dodge": return 320;
    case "end": return 400;
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#5a7a30" },
  topHeader: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  bannerLeft: {
    flex: 1,
    backgroundColor: theme.banner,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: theme.bannerDark,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  bannerRight: {
    flex: 1,
    backgroundColor: theme.banner,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: theme.bannerDark,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  bannerName: {
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  crossWrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10,
    zIndex: 5,
  },
  crossX: {
    position: "absolute",
    color: "#fff8d8",
    fontSize: 22,
    fontWeight: "900",
  },
  hpRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  hpBarOuter: {
    flex: 1,
    height: 16,
    backgroundColor: "#5a2a1a",
    borderWidth: 2,
    borderColor: "#3a1810",
    borderRadius: 3,
    overflow: "hidden",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  hpFill: {
    position: "absolute",
    left: 0, top: 0, bottom: 0,
    backgroundColor: "#e8a020",
  },
  hpLabel: {
    color: "#fff8d8",
    fontSize: 10,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  arena: {
    flex: 1,
    paddingHorizontal: 8,
  },
  fighterRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 12,
  },
  fighterLeft: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 0,
    flex: 1,
    justifyContent: "flex-start",
    position: "relative",
  },
  fighterRight: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 0,
    flex: 1,
    justifyContent: "flex-end",
    position: "relative",
  },
  logPanel: {
    backgroundColor: "rgba(40,28,12,0.85)",
    marginHorizontal: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.parchmentDark,
  },
  logTitle: {
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 2,
  },
  logLine: {
    color: "#f4e7c5",
    fontSize: 11,
    fontWeight: "600",
  },
  bottomBtns: {
    position: "absolute",
    right: 10,
    flexDirection: "row",
    gap: 6,
  },
  controlBtn: {
    backgroundColor: "rgba(58,32,12,0.85)",
    borderWidth: 1.5,
    borderColor: theme.parchmentDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  controlLabel: {
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
  resultOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  resultPanel: {
    backgroundColor: "#ecdcb1",
    borderRadius: 12,
    borderWidth: 3,
    borderColor: theme.woodDark,
    paddingHorizontal: 26,
    paddingVertical: 18,
    alignItems: "center",
    minWidth: 260,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 2,
  },
  resultSub: {
    color: theme.ink,
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },
  rewardText: {
    color: theme.ink,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 10,
  },
  fightBtn: {
    backgroundColor: "#f0dba0",
    borderColor: theme.woodDark,
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  fightLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: theme.ink,
    letterSpacing: 0.8,
  },
  floatNum: {
    position: "absolute",
    top: -10,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 32,
    fontWeight: "900",
    color: "#ffe080",
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  floatCrit: {
    fontSize: 44,
    color: "#ff5040",
  },
  floatDodge: {
    fontSize: 18,
    color: "#a8e0ff",
  },
  fallback: {
    flex: 1,
    backgroundColor: theme.parchment,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  fallbackText: {
    color: theme.ink,
    fontSize: 16,
    fontWeight: "800",
  },
  fallbackBtn: {
    backgroundColor: "#f0dba0",
    borderColor: theme.woodDark,
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
});
