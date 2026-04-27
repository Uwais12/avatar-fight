import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing, Pressable, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import Svg, { Defs, LinearGradient, Stop, Rect, Polygon } from "react-native-svg";

import { useGame } from "../lib/store";
import { theme } from "../lib/theme";
import { activePetsOf, applyLoss, applyWinReward, petCombatStatsOf, totalStats } from "../lib/game";
import { CHARACTER_ASSETS, characterIdFromSeed, petAssetFor, comboAssetFor } from "../lib/assets";
import type { BattleEvent, CombatantId, Pet, Player } from "../lib/types";

type FightSide = "p1" | "p2";

type Combatant = {
  id: CombatantId;
  side: FightSide;
  kind: "main" | "pet";
  name: string;
  maxHp: number;
  charSrc?: ReturnType<typeof comboAssetFor>;
  petSrc?: ReturnType<typeof petAssetFor>;
};

export default function BattleScreen() {
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const router = useRouter();
  const player = useGame((s) => s.player);
  const last = useGame((s) => s.lastBattle);
  const opponents = useGame((s) => s.opponents);
  const selectedId = useGame((s) => s.selectedOpponentId);
  const updatePlayer = useGame((s) => s.updatePlayer);
  const refreshOpponents = useGame((s) => s.refreshOpponents);

  const opponent = opponents.find((o) => o.id === selectedId);

  const combatants = useMemo(() => buildCombatants(player, opponent), [player, opponent]);
  const initialHps = useMemo(() => {
    const m: Record<CombatantId, number> = {};
    for (const c of combatants) m[c.id] = c.maxHp;
    return m;
  }, [combatants]);

  const [eventIdx, setEventIdx] = useState(0);
  const [hps, setHps] = useState<Record<CombatantId, number>>(initialHps);
  const [showResult, setShowResult] = useState(false);
  const [floats, setFloats] = useState<{ id: number; on: CombatantId; value: string; crit: boolean }[]>([]);
  const [logEntries, setLogEntries] = useState<string[]>([]);
  const [speedMul, setSpeedMul] = useState(1);
  const floatId = useRef(0);
  const rewardsApplied = useRef(false);

  const shakeRefs = useRef<Record<CombatantId, Animated.Value>>({});
  for (const c of combatants) {
    if (!shakeRefs.current[c.id]) shakeRefs.current[c.id] = new Animated.Value(0);
  }

  useEffect(() => {
    if (!last || !opponent) return;
    setHps(initialHps);
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
      // Apply HP map from event (resilient against legacy hp1After/hp2After events).
      if (ev.hps) {
        setHps({ ...ev.hps });
      } else if (ev.hp1After !== undefined && ev.hp2After !== undefined) {
        setHps((cur) => ({ ...cur, p1: ev.hp1After!, p2: ev.hp2After! }));
      }

      if (ev.t === "attack" || ev.t === "crit" || ev.t === "pet_attack") {
        const id = ++floatId.current;
        setFloats((cur) => [...cur, { id, on: ev.target, value: `${ev.damage ?? ""}`, crit: ev.t === "crit" }]);
        setTimeout(() => setFloats((cur) => cur.filter((f) => f.id !== id)), 800);
        const shake = shakeRefs.current[ev.target];
        if (shake) {
          const dir = combatants.find((c) => c.id === ev.target)?.side === "p1" ? -1 : 1;
          Animated.sequence([
            Animated.timing(shake, { toValue: 8 * dir, duration: 60, useNativeDriver: true, easing: Easing.linear }),
            Animated.timing(shake, { toValue: 0, duration: 100, useNativeDriver: true, easing: Easing.linear }),
          ]).start();
        }
        const verb = ev.t === "crit" ? "lands a CRIT on" : "hits";
        const aName = nameOf(ev.attacker, combatants);
        const tName = nameOf(ev.target, combatants);
        setLogEntries((l) => [...l.slice(-3), `${aName} ${verb} ${tName} for ${ev.damage}`]);
        if (ev.t === "crit") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } else if (ev.t === "dodge") {
        const id = ++floatId.current;
        setFloats((cur) => [...cur, { id, on: ev.target, value: "DODGE", crit: false }]);
        setTimeout(() => setFloats((cur) => cur.filter((f) => f.id !== id)), 700);
        setLogEntries((l) => [...l.slice(-3), `${nameOf(ev.target, combatants)} dodges!`]);
      } else if (ev.t === "death") {
        setLogEntries((l) => [...l.slice(-3), `${nameOf(ev.target, combatants)} falls!`]);
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

  const arenaH = Math.max(140, winH - insets.top - insets.bottom - 46 - 56 - 70 - 16);
  const p1Mains = combatants.filter((c) => c.side === "p1" && c.kind === "main");
  const p1Pets = combatants.filter((c) => c.side === "p1" && c.kind === "pet");
  const p2Mains = combatants.filter((c) => c.side === "p2" && c.kind === "main");
  const p2Pets = combatants.filter((c) => c.side === "p2" && c.kind === "pet");
  const totalLeft = 1 + p1Pets.length;
  const totalRight = 1 + p2Pets.length;
  const slotMaxLeft = Math.max(totalLeft, 2);
  const slotMaxRight = Math.max(totalRight, 2);
  const charSize = Math.min(170, Math.max(80, arenaH * 0.78));

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <BambooBg />

      <View style={styles.topHeader}>
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerName} numberOfLines={1}>{player.name}</Text>
        </View>
        <View style={styles.crossWrap}>
          <Svg width={48} height={48}>
            <Defs>
              <LinearGradient id="cb" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#c44030" />
                <Stop offset="1" stopColor="#7a1810" />
              </LinearGradient>
            </Defs>
            <Polygon points="24,0 48,17 48,36 24,48 0,36 0,17" fill="url(#cb)" stroke="#3a0808" strokeWidth="2" />
          </Svg>
          <Text style={styles.crossX}>⚔</Text>
        </View>
        <View style={styles.bannerRight}>
          <Text style={[styles.bannerName, { textAlign: "right" }]} numberOfLines={1}>{opponent.name}</Text>
        </View>
      </View>

      {/* HP bar grids — main on top, pets stacked below, per side */}
      <View style={styles.hpGridRow}>
        <View style={styles.hpStack}>
          {[...p1Mains, ...p1Pets].map((c) => (
            <SmallHpBar key={c.id} side="left" name={c.name} max={c.maxHp} cur={hps[c.id] ?? 0} kind={c.kind} />
          ))}
        </View>
        <View style={{ width: 12 }} />
        <View style={styles.hpStack}>
          {[...p2Mains, ...p2Pets].map((c) => (
            <SmallHpBar key={c.id} side="right" name={c.name} max={c.maxHp} cur={hps[c.id] ?? 0} kind={c.kind} />
          ))}
        </View>
      </View>

      <View style={styles.arena}>
        <View style={styles.fighterRow}>
          <View style={styles.sideCol}>
            {[...p1Mains, ...p1Pets].map((c) => (
              <FighterSprite
                key={c.id}
                combatant={c}
                hp={hps[c.id] ?? 0}
                shake={shakeRefs.current[c.id]}
                charSize={c.kind === "main" ? charSize : charSize * 0.6}
                facing="right"
                slotMax={slotMaxLeft}
                floats={floats.filter((f) => f.on === c.id)}
              />
            ))}
          </View>

          <View style={styles.sideCol}>
            {[...p2Mains, ...p2Pets].map((c) => (
              <FighterSprite
                key={c.id}
                combatant={c}
                hp={hps[c.id] ?? 0}
                shake={shakeRefs.current[c.id]}
                charSize={c.kind === "main" ? charSize : charSize * 0.6}
                facing="left"
                slotMax={slotMaxRight}
                floats={floats.filter((f) => f.on === c.id)}
              />
            ))}
          </View>
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
          if (lastEv.hps) setHps({ ...lastEv.hps });
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

function buildCombatants(player: Player, opponent: Player | undefined): Combatant[] {
  const out: Combatant[] = [];
  if (!opponent) return out;

  const playerMaxHp = totalStats(player).hp;
  out.push({
    id: "p1",
    side: "p1",
    kind: "main",
    name: player.name || "You",
    maxHp: playerMaxHp,
    charSrc: comboAssetFor(
      player.charClass ?? characterIdFromSeed(player.avatarSeed),
      player.equipment?.chest?.iconKey,
      player.equipment?.weapon?.iconKey,
    ) ?? CHARACTER_ASSETS[characterIdFromSeed(player.avatarSeed)],
  });
  activePetsOf(player).forEach((pet, i) => {
    out.push({
      id: `p1_pet_${i}`,
      side: "p1",
      kind: "pet",
      name: pet.name,
      maxHp: petCombatStatsOf(player, pet).hp,
      petSrc: petAssetFor(pet.id),
    });
  });

  const oppMaxHp = totalStats(opponent).hp;
  out.push({
    id: "p2",
    side: "p2",
    kind: "main",
    name: opponent.name,
    maxHp: oppMaxHp,
    charSrc: comboAssetFor(
      opponent.charClass ?? characterIdFromSeed(opponent.avatarSeed),
      opponent.equipment?.chest?.iconKey,
      opponent.equipment?.weapon?.iconKey,
    ) ?? CHARACTER_ASSETS[characterIdFromSeed(opponent.avatarSeed)],
  });
  activePetsOf(opponent).forEach((pet, i) => {
    out.push({
      id: `p2_pet_${i}`,
      side: "p2",
      kind: "pet",
      name: pet.name,
      maxHp: petCombatStatsOf(opponent, pet).hp,
      petSrc: petAssetFor(pet.id),
    });
  });

  return out;
}

function nameOf(id: CombatantId, combatants: Combatant[]): string {
  return combatants.find((c) => c.id === id)?.name ?? id;
}

function FighterSprite({
  combatant,
  hp,
  shake,
  charSize,
  facing,
  slotMax,
  floats,
}: {
  combatant: Combatant;
  hp: number;
  shake?: Animated.Value;
  charSize: number;
  facing: "left" | "right";
  slotMax: number;
  floats: { id: number; value: string; crit: boolean }[];
}) {
  const dead = hp <= 0;
  const flip = facing === "left";
  const src = combatant.kind === "main" ? combatant.charSrc : combatant.petSrc;
  return (
    <Animated.View style={[
      styles.fighterSlot,
      { flex: 1 / slotMax, opacity: dead ? 0.35 : 1, transform: [{ translateX: shake ?? new Animated.Value(0) }] },
    ]}>
      {src && (
        <Image
          source={src}
          style={{
            width: charSize,
            height: charSize,
            transform: flip ? [{ scaleX: -1 }] : undefined,
          }}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      )}
      {dead && <Text style={styles.deadX}>✕</Text>}
      {floats.map((f) => <FloatNum key={f.id} value={f.value} crit={f.crit} />)}
    </Animated.View>
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

function SmallHpBar({ side, name, max, cur, kind }: { side: "left" | "right"; name: string; max: number; cur: number; kind: "main" | "pet" }) {
  const pct = Math.max(0, Math.min(1, cur / Math.max(1, max)));
  return (
    <View style={[styles.hpRow, side === "right" && { flexDirection: "row-reverse" }]}>
      <Text style={[styles.hpName, kind === "pet" && styles.hpNamePet]} numberOfLines={1}>{name}</Text>
      <View style={[styles.hpBarOuter, kind === "pet" && { height: 8 }]}>
        <View style={[
          styles.hpFill,
          { width: `${pct * 100}%`, backgroundColor: kind === "pet" ? "#9050d0" : "#e8a020" },
          side === "right" && { right: 0, left: undefined },
        ]} />
      </View>
      <Text style={styles.hpVal}>{cur}/{max}</Text>
    </View>
  );
}

function FloatNum({ value, crit }: { value: string; crit: boolean }) {
  const ty = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(ty, { toValue: -50, duration: 700, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.timing(op, { toValue: 0, duration: 700, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
    ]).start();
  }, []);
  return (
    <Animated.Text
      style={[
        styles.floatNum,
        crit && styles.floatCrit,
        value === "DODGE" && styles.floatDodge,
        { transform: [{ translateY: ty as unknown as number }], opacity: op as unknown as number },
      ]}
    >
      {value}
    </Animated.Text>
  );
}

function eventDelay(ev: BattleEvent): number {
  switch (ev.t) {
    case "start": return 250;
    case "attack": case "pet_attack": return 320;
    case "crit": return 460;
    case "dodge": return 280;
    case "death": return 280;
    case "end": return 360;
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
    paddingVertical: 6,
  },
  bannerRight: {
    flex: 1,
    backgroundColor: theme.banner,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: theme.bannerDark,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  bannerName: {
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  crossWrap: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -8,
    zIndex: 5,
  },
  crossX: {
    position: "absolute",
    color: "#fff8d8",
    fontSize: 18,
    fontWeight: "900",
  },
  hpGridRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  hpStack: {
    flex: 1,
    gap: 2,
  },
  hpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  hpName: {
    color: "#fff8d8",
    fontSize: 9,
    fontWeight: "900",
    minWidth: 40,
    maxWidth: 80,
  },
  hpNamePet: {
    color: "#d8c8ff",
    fontSize: 8,
  },
  hpBarOuter: {
    flex: 1,
    height: 12,
    backgroundColor: "#3a1810",
    borderWidth: 1.5,
    borderColor: "#1a0808",
    borderRadius: 3,
    overflow: "hidden",
  },
  hpFill: {
    position: "absolute",
    left: 0, top: 0, bottom: 0,
  },
  hpVal: {
    color: "#fff8d8",
    fontSize: 9,
    fontWeight: "800",
    minWidth: 50,
    textAlign: "right",
  },
  arena: { flex: 1, paddingHorizontal: 4 },
  fighterRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 12,
  },
  sideCol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
  },
  fighterSlot: {
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  deadX: {
    position: "absolute",
    fontSize: 50,
    color: "#a82820",
    fontWeight: "900",
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
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
    fontSize: 26,
    fontWeight: "900",
    color: "#ffe080",
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  floatCrit: {
    fontSize: 36,
    color: "#ff5040",
  },
  floatDodge: {
    fontSize: 16,
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
