import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, useWindowDimensions, Pressable, TextInput, Alert } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { Redirect } from "expo-router";

import { useGame } from "../lib/store";
import { ParchmentBg } from "../components/ParchmentBg";
import { TopResourceBar } from "../components/TopResourceBar";
import { BottomNav } from "../components/BottomNav";
import { CharacterShowcase } from "../components/CharacterShowcase";
import { StatBadge, PowerBox } from "../components/StatBadge";
import { EquipmentSlot } from "../components/EquipmentSlot";
import { totalStats, powerOf, classLabel, xpForLevel, SLOTS } from "../lib/game";
import type { EquipSlot } from "../lib/types";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

export default function Home() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const player = useGame((s) => s.player);
  const opponents = useGame((s) => s.opponents);
  const ensure = useGame((s) => s.ensureOpponents);
  const setName = useGame((s) => s.setName);
  const reset = useGame((s) => s.reset);
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(player.name);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
    if (opponents.length === 0) ensure();
  }, []);

  if (!player.onboarded) {
    return <Redirect href="/welcome" />;
  }

  const stats = totalStats(player);
  const power = powerOf(player);
  const xpNeeded = xpForLevel(player.level);
  const xpPct = Math.min(1, player.xp / xpNeeded);
  const winRate = player.wins + player.losses > 0
    ? Math.round((player.wins / (player.wins + player.losses)) * 100) : 0;

  const headerH = 38;
  const navH = 38;
  const bodyH = height - headerH - navH;
  const leftW = Math.min(170, width * 0.20);
  const rightW = Math.min(160, width * 0.20);
  const centerW = width - leftW - rightW - 24;

  const saveName = () => {
    setName(nameDraft.trim() || "Hero");
    setEditing(false);
    Haptics.selectionAsync().catch(() => {});
  };

  return (
    <ParchmentBg style={styles.root}>
      <TopResourceBar player={player} />

      <View style={[styles.body, { height: bodyH }]}>
        {/* LEFT: stats + record + edit */}
        <View style={[styles.leftCol, { width: leftW }]}>
          <PowerBox value={power} />
          <StatBadge label="STR" value={stats.str} />
          <StatBadge label="AGL" value={stats.agl} />
          <StatBadge label="SPD" value={stats.spd} />
          <StatBadge label="HP" value={stats.hp} />
          <View style={styles.xpWrap}>
            <Text style={styles.xpLabel}>Lv {player.level}</Text>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${xpPct * 100}%` }]} />
            </View>
            <Text style={styles.xpText}>{player.xp} / {xpNeeded}</Text>
          </View>
          <View style={styles.recordRow}>
            <Text style={styles.recordCell}>W {player.wins}</Text>
            <Text style={styles.recordCell}>L {player.losses}</Text>
            <Text style={styles.recordCell}>{winRate}%</Text>
          </View>
        </View>

        {/* CENTER: character showcase + name */}
        <View style={[styles.center, { width: centerW }]}>
          {editing ? (
            <View style={styles.editNameRow}>
              <TextInput
                value={nameDraft}
                onChangeText={setNameDraft}
                style={styles.nameInput}
                autoFocus
                maxLength={16}
                onSubmitEditing={saveName}
              />
              <Pressable style={styles.smallBtn} onPress={saveName}>
                <Text style={styles.smallBtnLabel}>SAVE</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setEditing(true)} style={styles.nameRow}>
              <Text style={styles.nameText}>✏️ {player.name}</Text>
            </Pressable>
          )}
          <CharacterShowcase
            charClass={player.charClass}
            petKind={player.pet?.kind ?? player.pet?.id}
            name={player.name}
            level={player.level}
            classLabel={classLabel(player.charClass)}
            power={power}
            width={centerW - 4}
            height={bodyH - 56}
            background="parchment"
            showLabel={false}
          />
        </View>

        {/* RIGHT: equipment grid 2x3 */}
        <View style={[styles.rightCol, { width: rightW }]}>
          <Text style={styles.sectionTitle}>EQUIPMENT</Text>
          <View style={styles.equipGrid}>
            {SLOTS.map((slot) => (
              <View key={slot} style={styles.equipCell}>
                <EquipmentSlot
                  slot={slot}
                  equipment={player.equipment[slot]}
                  size={(rightW - 18) / 2}
                  onPress={() => router.push("/shop")}
                />
                <Text style={styles.equipLabel}>{slot.toUpperCase()}</Text>
              </View>
            ))}
          </View>
          <Pressable
            style={styles.resetBtn}
            onPress={() => Alert.alert("Reset progress?", "All stats and gear will be wiped.", [
              { text: "Cancel", style: "cancel" },
              { text: "Reset", style: "destructive", onPress: () => { reset(); } },
            ])}
          >
            <Text style={styles.resetText}>RESET</Text>
          </Pressable>
        </View>
      </View>

      <BottomNav />
    </ParchmentBg>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: {
    flexDirection: "row",
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 6,
  },
  leftCol: {
    paddingVertical: 2,
    gap: 4,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 4,
  },
  rightCol: {
    paddingVertical: 2,
    gap: 4,
  },
  sectionTitle: {
    color: "#7a1f1f",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1.2,
    textAlign: "center",
  },
  xpWrap: {
    backgroundColor: "#f6e8be",
    borderWidth: 1.5,
    borderColor: "#7a4a25",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  xpLabel: { color: "#3a2812", fontWeight: "900", fontSize: 11 },
  xpBar: {
    height: 8,
    backgroundColor: "#7a4a25",
    borderRadius: 2,
    marginTop: 2,
    overflow: "hidden",
  },
  xpFill: { height: "100%", backgroundColor: "#3a8c3a" },
  xpText: { color: "#3a2812", fontWeight: "700", fontSize: 9, marginTop: 2, textAlign: "right" },
  recordRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f6e8be",
    borderWidth: 1.5,
    borderColor: "#7a4a25",
    borderRadius: 4,
    paddingVertical: 4,
  },
  recordCell: {
    color: "#3a2812",
    fontWeight: "900",
    fontSize: 11,
  },
  nameRow: {
    backgroundColor: "rgba(246, 232, 190, 0.85)",
    borderWidth: 1.5,
    borderColor: "#7a4a25",
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  nameText: {
    color: "#3a2812",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  editNameRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  nameInput: {
    backgroundColor: "#fff8d8",
    borderWidth: 2,
    borderColor: "#7a4a25",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 14,
    fontWeight: "900",
    color: "#3a2812",
    minWidth: 140,
  },
  smallBtn: {
    backgroundColor: "#c44030",
    borderWidth: 2,
    borderColor: "#5a0e08",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  smallBtnLabel: {
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  equipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "center",
  },
  equipCell: {
    alignItems: "center",
    gap: 1,
  },
  equipLabel: {
    color: "#7a4a25",
    fontWeight: "800",
    fontSize: 8,
    letterSpacing: 0.3,
  },
  resetBtn: {
    backgroundColor: "rgba(122, 30, 30, 0.65)",
    borderRadius: 4,
    paddingVertical: 4,
    alignItems: "center",
    marginTop: 2,
  },
  resetText: {
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 9,
    letterSpacing: 1,
  },
});
