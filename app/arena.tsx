import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import * as ScreenOrientation from "expo-screen-orientation";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGame } from "../lib/store";
import { ParchmentBg } from "../components/ParchmentBg";
import { TopResourceBar } from "../components/TopResourceBar";
import { BottomNav } from "../components/BottomNav";
import { CharacterShowcase } from "../components/CharacterShowcase";
import { StatBadge, PowerBox } from "../components/StatBadge";
import { simulateBattle, totalStats, applyLoss, applyWinReward, powerOf, classLabel } from "../lib/game";
import { characterAssets } from "../lib/assets";
import type { Player } from "../lib/types";

export default function Arena() {
  const router = useRouter();
  const { width: rawW, height: rawH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const width = rawW - insets.left - insets.right;
  const height = rawH - insets.top - insets.bottom;
  const player = useGame((s) => s.player);
  const opponents = useGame((s) => s.opponents);
  const selectedId = useGame((s) => s.selectedOpponentId);
  const refreshOpponents = useGame((s) => s.refreshOpponents);
  const selectOpponent = useGame((s) => s.selectOpponent);
  const setLastBattle = useGame((s) => s.setLastBattle);
  const updatePlayer = useGame((s) => s.updatePlayer);
  const ensure = useGame((s) => s.ensureOpponents);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
    if (opponents.length === 0) ensure();
  }, []);

  const selected = useMemo(
    () => opponents.find((o) => o.id === selectedId) ?? opponents[0] ?? null,
    [opponents, selectedId]
  );

  const handleFight = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const r = simulateBattle(player, selected);
    setLastBattle({ winner: r.winner, events: r.events, opponentName: selected.name, opponentLevel: selected.level });
    router.push("/battle");
  };

  const handleFightAll = () => {
    if (opponents.length === 0) return;
    let p = player;
    let wins = 0, losses = 0;
    for (const opp of opponents) {
      const r = simulateBattle(p, opp);
      if (r.winner === "p1") { wins++; p = applyWinReward(p, opp.level); }
      else { losses++; p = applyLoss(p); }
    }
    updatePlayer(() => p);
    refreshOpponents();
    Alert.alert("Sweep complete", `Won ${wins} • Lost ${losses}`);
  };

  const handleConquer = () => {
    if (!selected) return;
    const goldStolen = Math.floor(player.level * 25 + Math.random() * 50);
    updatePlayer((p) => ({ ...p, gold: p.gold + goldStolen, crystals: p.crystals + 2 }));
    Alert.alert("Conquered!", `+${goldStolen} 🪙  +2 💎  from ${selected.name}`);
  };

  const headerH = 38;
  const navH = 38;
  const bodyH = height - headerH - navH;
  const leftW = Math.min(180, Math.max(140, width * 0.24));
  const rightW = Math.min(170, Math.max(140, width * 0.22));
  const centerW = width - leftW - rightW - 22;

  return (
    <ParchmentBg style={styles.root}>
      <TopResourceBar title={`ARENA · LV ${player.level}`} />

      <View style={[styles.body, { height: bodyH }]}>
        <View style={[styles.leftCol, { width: leftW }]}>
          <View style={styles.colHeader}>
            <Text style={styles.colHeaderText}>OPPONENTS</Text>
            <Pressable onPress={() => { refreshOpponents(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); }}>
              <Text style={styles.refreshIcon}>↻</Text>
            </Pressable>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.opponentList} showsVerticalScrollIndicator={false}>
            {opponents.map((o) => (
              <OpponentCard
                key={o.id}
                opponent={o}
                selected={o.id === selectedId}
                onPress={() => { selectOpponent(o.id); Haptics.selectionAsync().catch(() => {}); }}
              />
            ))}
          </ScrollView>
        </View>

        <View style={[styles.center, { width: centerW }]}>
          {selected && (
            <CharacterShowcase
              charClass={selected.charClass}
              petKind={selected.pet?.kind}
              name={selected.name}
              level={selected.level}
              classLabel={classLabel(selected.charClass)}
              power={powerOf(selected)}
              width={centerW - 4}
              height={bodyH - 12}
              background="bamboo"
            />
          )}
        </View>

        <View style={[styles.rightCol, { width: rightW }]}>
          {selected && (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 4, paddingBottom: 6 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.enemyName} numberOfLines={1}>{selected.name}</Text>
              <Text style={styles.enemyMeta}>{classLabel(selected.charClass)} · Lv {selected.level}</Text>
              {selected.guild && <Text style={styles.enemyGuild} numberOfLines={1}>🏰 {selected.guild}</Text>}
              <PowerBox value={powerOf(selected)} />
              <StatBadge label="STR" value={totalStats(selected).str} />
              <StatBadge label="AGL" value={totalStats(selected).agl} />
              <StatBadge label="SPD" value={totalStats(selected).spd} />
              <StatBadge label="HP" value={totalStats(selected).hp} />
              <Pressable style={[styles.actionBtn, styles.actionFight]} onPress={handleFight}>
                <Text style={[styles.actionLabel, { color: "#fff8d8" }]}>FIGHT</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={handleConquer}>
                <Text style={styles.actionLabel}>CONQUER</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={handleFightAll}>
                <Text style={styles.actionLabel}>FIGHT ALL</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>

      <BottomNav />
    </ParchmentBg>
  );
}

function OpponentCard({ opponent, selected, onPress }: { opponent: Player; selected: boolean; onPress: () => void }) {
  const src = (opponent.charClass && characterAssets[opponent.charClass]) ?? characterAssets.knight;
  return (
    <Pressable onPress={onPress} style={[styles.oppCard, selected && styles.oppCardSelected]}>
      <View style={styles.oppPortrait}>
        <Image source={src} style={styles.oppImg} contentFit="cover" cachePolicy="memory-disk" />
        <View style={styles.oppLvBadge}>
          <Text style={styles.oppLvText}>Lv{opponent.level}</Text>
        </View>
      </View>
      <View style={styles.oppText}>
        <Text style={styles.oppName} numberOfLines={1}>{opponent.name}</Text>
        <Text style={styles.oppPwr}>PWR {powerOf(opponent)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flexDirection: "row", paddingHorizontal: 6, paddingVertical: 4, gap: 6 },
  leftCol: { paddingVertical: 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  rightCol: { paddingVertical: 2 },
  colHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 3,
  },
  colHeaderText: { color: "#3a2812", fontWeight: "900", fontSize: 12, letterSpacing: 1 },
  refreshIcon: { fontSize: 16, color: "#3a2812", fontWeight: "900" },
  opponentList: { gap: 4, paddingBottom: 8 },
  oppCard: {
    flexDirection: "row",
    backgroundColor: "#f6e8be",
    borderColor: "#7a4a25",
    borderWidth: 1.5,
    borderRadius: 6,
    overflow: "hidden",
    height: 44,
  },
  oppCardSelected: { borderColor: "#a82820", borderWidth: 2.5 },
  oppPortrait: {
    width: 44,
    height: "100%",
    backgroundColor: "#dcc488",
    position: "relative",
  },
  oppImg: { width: "100%", height: "100%" },
  oppLvBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(58, 24, 8, 0.85)",
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderBottomRightRadius: 3,
  },
  oppLvText: { color: "#fff8d8", fontWeight: "900", fontSize: 9 },
  oppText: { flex: 1, justifyContent: "center", paddingHorizontal: 6, gap: 1 },
  oppName: { color: "#3a2812", fontWeight: "900", fontSize: 12 },
  oppPwr: { color: "#7a4a25", fontWeight: "700", fontSize: 10 },
  enemyName: { fontSize: 14, fontWeight: "900", color: "#3a2812" },
  enemyMeta: { fontSize: 11, color: "#7a4a25", fontWeight: "700" },
  enemyGuild: { fontSize: 11, color: "#3a5882", fontWeight: "700" },
  actionBtn: {
    backgroundColor: "#f0dba0",
    borderColor: "#7a4a25",
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 2,
  },
  actionFight: {
    backgroundColor: "#c44030",
    borderColor: "#5a0e08",
  },
  actionLabel: { color: "#3a2812", fontWeight: "900", fontSize: 13, letterSpacing: 0.6 },
});
