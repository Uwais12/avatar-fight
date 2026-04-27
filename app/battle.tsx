import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { useGame } from "../lib/store";
import { theme } from "../lib/theme";
import { Avatar } from "../components/Avatar";
import { PetSprite } from "../components/PetSprite";
import { HpBar } from "../components/HpBar";
import { WoodButton } from "../components/WoodButton";
import { Parchment } from "../components/Parchment";
import { applyLoss, applyWinReward, totalStats } from "../lib/game";
import type { BattleEvent } from "../lib/types";

export default function BattleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const player = useGame((s) => s.player);
  const last = useGame((s) => s.lastBattle);
  const opponents = useGame((s) => s.opponents);
  const selectedId = useGame((s) => s.selectedOpponentId);
  const updatePlayer = useGame((s) => s.updatePlayer);
  const setLastBattle = useGame((s) => s.setLastBattle);
  const refreshOpponents = useGame((s) => s.refreshOpponents);

  const opponent = opponents.find((o) => o.id === selectedId);

  const [eventIdx, setEventIdx] = useState(0);
  const [hp1, setHp1] = useState(0);
  const [hp2, setHp2] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [floatNumbers, setFloatNumbers] = useState<{ id: number; side: "p1" | "p2"; value: string; crit: boolean }[]>([]);
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
        const val = ev.damage ? `-${ev.damage}` : "";
        const isCrit = ev.t === "crit";
        const id = ++floatId.current;
        setFloatNumbers((cur) => [...cur, { id, side, value: val, crit: isCrit }]);
        setTimeout(() => setFloatNumbers((cur) => cur.filter((f) => f.id !== id)), 800);
        const target = side === "p1" ? p1Shake : p2Shake;
        Animated.sequence([
          Animated.timing(target, { toValue: side === "p1" ? -8 : 8, duration: 60, useNativeDriver: true, easing: Easing.linear }),
          Animated.timing(target, { toValue: 0, duration: 100, useNativeDriver: true, easing: Easing.linear }),
        ]).start();
        if (isCrit) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } else if (ev.t === "dodge") {
        const id = ++floatId.current;
        setFloatNumbers((cur) => [...cur, { id, side: ev.target, value: "DODGE", crit: false }]);
        setTimeout(() => setFloatNumbers((cur) => cur.filter((f) => f.id !== id)), 700);
      } else if (ev.t === "end") {
        setShowResult(true);
        if (last.winner === "p1") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        if (!rewardsApplied.current && opponent) {
          rewardsApplied.current = true;
          if (last.winner === "p1") {
            updatePlayer((p) => applyWinReward(p, opponent.level));
          } else {
            updatePlayer((p) => applyLoss(p));
          }
        }
      }

      setEventIdx((i) => i + 1);
    }, eventDelay(ev));

    return () => clearTimeout(tick);
  }, [eventIdx, last]);

  if (!last || !opponent) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 20 }]}>
        <Text style={{ color: theme.ink, textAlign: "center" }}>No active battle</Text>
        <WoodButton label="BACK" onPress={() => router.back()} />
      </View>
    );
  }

  const won = last.winner === "p1";

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.bannerRow}>
        <View style={[styles.nameBanner, { borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}>
          <Text style={styles.bannerName} numberOfLines={1}>{player.name}</Text>
        </View>
        <View style={styles.bannerCenter}>
          <Text style={styles.bannerCross}>⚔</Text>
        </View>
        <View style={[styles.nameBanner, { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}>
          <Text style={[styles.bannerName, { textAlign: "right" }]} numberOfLines={1}>{opponent.name}</Text>
        </View>
      </View>

      <View style={styles.hpRow}>
        <HpBar label={`${hp1}/${maxHp1}`} current={hp1} max={maxHp1} />
        <HpBar label={`${hp2}/${maxHp2}`} current={hp2} max={maxHp2} reverse />
      </View>

      <View style={styles.arena}>
        <View style={styles.bgOverlay} />
        <View style={styles.fighterRow}>
          <Animated.View style={[styles.fighter, { transform: [{ translateX: p1Shake }] }]}>
            {player.pet && (
              <PetSprite spriteKey={player.pet.spriteKey} size={86} style={{ marginRight: -10 }} />
            )}
            <Avatar seed={player.avatarSeed} style={player.avatarStyle} size={140} framed={false} />
            {floatNumbers.filter(f => f.side === "p1").map(f => (
              <FloatNumber key={f.id} value={f.value} crit={f.crit} side="p1" />
            ))}
          </Animated.View>

          <Animated.View style={[styles.fighter, { transform: [{ translateX: p2Shake }, { scaleX: -1 }] }]}>
            {opponent.pet && (
              <PetSprite spriteKey={opponent.pet.spriteKey} size={86} style={{ marginRight: -10 }} />
            )}
            <Avatar seed={opponent.avatarSeed} style={opponent.avatarStyle} size={140} framed={false} />
            {floatNumbers.filter(f => f.side === "p2").map(f => (
              <FloatNumber key={f.id} value={f.value} crit={f.crit} side="p2" reverseAnchor />
            ))}
          </Animated.View>
        </View>
      </View>

      {showResult && (
        <View style={styles.resultOverlay}>
          <Parchment style={{ width: "82%" }}>
            <View style={styles.resultInner}>
              <Text style={[styles.resultTitle, { color: won ? theme.green : theme.red }]}>
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
                <WoodButton label="REMATCH" onPress={() => {
                  const same = opponents.find(o => o.id === selectedId);
                  if (same) {
                    setEventIdx(0);
                    setShowResult(false);
                    rewardsApplied.current = false;
                    setHp1(maxHp1);
                    setHp2(maxHp2);
                    const { simulateBattle } = require("../lib/game");
                    const r = simulateBattle(player, same);
                    setLastBattle({ winner: r.winner, events: r.events, opponentName: same.name, opponentLevel: same.level });
                  }
                }} />
                <WoodButton label="BACK" variant="secondary" onPress={() => {
                  refreshOpponents();
                  router.back();
                }} />
              </View>
            </View>
          </Parchment>
        </View>
      )}

      <Pressable style={styles.skipBtn} onPress={() => {
        if (!last) return;
        const lastEv = last.events[last.events.length - 1];
        setHp1(lastEv.hp1After);
        setHp2(lastEv.hp2After);
        setEventIdx(last.events.length);
        setShowResult(true);
        if (!rewardsApplied.current && opponent) {
          rewardsApplied.current = true;
          if (last.winner === "p1") {
            updatePlayer((p) => applyWinReward(p, opponent.level));
          } else {
            updatePlayer((p) => applyLoss(p));
          }
        }
      }}>
        <Text style={styles.skipText}>SKIP ▶▶</Text>
      </Pressable>
    </View>
  );
}

function eventDelay(ev: BattleEvent): number {
  switch (ev.t) {
    case "start": return 300;
    case "attack": return 380;
    case "pet_attack": return 380;
    case "crit": return 520;
    case "dodge": return 320;
    case "end": return 500;
  }
}

function FloatNumber({ value, crit, side, reverseAnchor }: { value: string; crit: boolean; side: "p1" | "p2"; reverseAnchor?: boolean }) {
  const ty = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(ty, { toValue: -50, duration: 700, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
    ]).start();
  }, []);
  return (
    <Animated.Text
      style={[
        styles.floatNum,
        crit ? styles.floatCrit : null,
        value === "DODGE" ? styles.floatDodge : null,
        reverseAnchor ? { transform: [{ scaleX: -1 }, { translateY: ty as any }] } : { transform: [{ translateY: ty as any }] },
        { opacity: opacity as any },
      ]}
    >
      {value}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.parchmentDark,
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  nameBanner: {
    flex: 1,
    backgroundColor: theme.banner,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    justifyContent: "center",
  },
  bannerName: {
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
  },
  bannerCenter: {
    width: 50,
    backgroundColor: theme.bannerDark,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerCross: {
    fontSize: 22,
    color: "#fff8d8",
  },
  hpRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 8,
  },
  arena: {
    flex: 1,
    backgroundColor: "#6b8e3a",
    margin: 0,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  bgOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "#5a7a30",
    opacity: 0.3,
  },
  fighterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  fighter: {
    alignItems: "flex-end",
    flexDirection: "row",
    position: "relative",
  },
  resultOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  resultInner: {
    padding: 18,
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 2,
  },
  resultSub: {
    color: theme.ink,
    fontSize: 14,
    marginTop: 4,
    fontWeight: "600",
  },
  rewardText: {
    color: theme.ink,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 10,
  },
  floatNum: {
    position: "absolute",
    top: -10,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 26,
    fontWeight: "900",
    color: "#ffe080",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  floatCrit: {
    fontSize: 36,
    color: "#ff5040",
  },
  floatDodge: {
    fontSize: 18,
    color: "#a8e0ff",
  },
  skipBtn: {
    position: "absolute",
    bottom: 26,
    right: 14,
    backgroundColor: "rgba(58, 40, 18, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  skipText: {
    color: "#fff8d8",
    fontWeight: "800",
    letterSpacing: 1,
    fontSize: 12,
  },
});
