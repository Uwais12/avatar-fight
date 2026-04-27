import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, useWindowDimensions, Pressable, TextInput, Alert } from "react-native";
import { Image } from "expo-image";
import * as ScreenOrientation from "expo-screen-orientation";
import { Redirect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGame } from "../lib/store";
import { ParchmentBg } from "../components/ParchmentBg";
import { TopResourceBar } from "../components/TopResourceBar";
import { BottomNav } from "../components/BottomNav";
import { CharacterShowcase } from "../components/CharacterShowcase";
import { PowerBox } from "../components/StatBadge";
import { EquipmentSlot } from "../components/EquipmentSlot";
import { totalStats, powerOf, classLabel, xpForLevel, SLOTS } from "../lib/game";
import { petAssetFor } from "../lib/assets";

export default function Home() {
  const router = useRouter();
  const { width: rawW, height: rawH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const width = rawW - insets.left - insets.right;
  const height = rawH - insets.top - insets.bottom;
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

  const leftW = Math.round(width * 0.26);
  const rightW = Math.round(width * 0.28);
  const gap = 6;
  const centerW = width - leftW - rightW - gap * 2 - 12; // 12 = horizontal padding

  // 3-col grid: rightW - panel padding(12) - 2 gaps(8) = available for cells, /3 = cell width
  const slotSize = Math.max(38, Math.min(56, Math.floor((rightW - 28) / 3) - 4));

  const saveName = () => {
    setName(nameDraft.trim() || "Hero");
    setEditing(false);
    Haptics.selectionAsync().catch(() => {});
  };

  const petSrc = player.pet ? petAssetFor(player.pet.id) : null;

  return (
    <ParchmentBg style={styles.root}>
      <TopResourceBar player={player} />

      <View style={[styles.body, { height: bodyH, gap }]}>
        {/* LEFT: power + stats */}
        <View style={[styles.col, { width: leftW }]}>
          <PowerBox value={power} />

          <View style={styles.statsGrid}>
            <StatChip label="STR" value={stats.str} accent="#c44030" />
            <StatChip label="AGL" value={stats.agl} accent="#3a8c3a" />
            <StatChip label="SPD" value={stats.spd} accent="#3070b8" />
            <StatChip label="HP" value={stats.hp} accent="#a06840" />
          </View>

          <View style={styles.xpWrap}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpLabel}>Lv {player.level}</Text>
              <Text style={styles.xpText}>{player.xp}/{xpNeeded}</Text>
            </View>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${xpPct * 100}%` }]} />
            </View>
          </View>

          <View style={styles.recordRow}>
            <RecordCell label="W" value={player.wins} color="#3a8c3a" />
            <RecordCell label="L" value={player.losses} color="#c44030" />
            <RecordCell label="%" value={`${winRate}`} color="#a87838" />
          </View>
        </View>

        {/* CENTER: showcase + name */}
        <View style={[styles.center, { width: centerW }]}>
          <View style={styles.nameWrap}>
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
                <Text style={styles.nameText} numberOfLines={1}>
                  ✏️ {player.name} <Text style={styles.classText}>· {classLabel(player.charClass)}</Text>
                </Text>
              </Pressable>
            )}
          </View>

          <CharacterShowcase
            player={player}
            charClass={player.charClass}
            petKind={player.pet?.kind ?? player.pet?.id}
            name={player.name}
            level={player.level}
            classLabel={classLabel(player.charClass)}
            power={power}
            width={centerW}
            height={bodyH - 40}
            background="parchment"
            showLabel={false}
          />
        </View>

        {/* RIGHT: equipment + pet */}
        <View style={[styles.col, { width: rightW }]}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>EQUIPMENT</Text>
            <View style={styles.equipGrid}>
              {SLOTS.map((slot) => (
                <View key={slot} style={[styles.equipCell, { width: slotSize + 4 }]}>
                  <EquipmentSlot
                    slot={slot}
                    equipment={player.equipment[slot]}
                    size={slotSize}
                    onPress={() => router.push("/bag")}
                  />
                  <Text style={styles.equipLabel} numberOfLines={1}>{slot.toUpperCase()}</Text>
                </View>
              ))}
              <View style={[styles.equipCell, { width: slotSize + 4 }]}>
                <Pressable
                  onPress={() => router.push(player.pet ? "/bag" : "/shop")}
                  style={[styles.petSlot, { width: slotSize, height: slotSize, borderColor: player.pet ? "#a050c0" : "#7a4a25" }]}
                >
                  {petSrc ? (
                    <Image source={petSrc} style={{ width: slotSize - 8, height: slotSize - 8 }} contentFit="contain" />
                  ) : (
                    <Text style={[styles.petFallback, { fontSize: slotSize * 0.45 }]}>🐾</Text>
                  )}
                </Pressable>
                <Text style={styles.equipLabel} numberOfLines={1}>PET</Text>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.resetBtn}
            onPress={() => Alert.alert("Reset progress?", "All stats and gear will be wiped.", [
              { text: "Cancel", style: "cancel" },
              { text: "Reset", style: "destructive", onPress: () => { reset(); } },
            ])}
          >
            <Text style={styles.resetText}>RESET PROGRESS</Text>
          </Pressable>
        </View>
      </View>

      <BottomNav />
    </ParchmentBg>
  );
}

function StatChip({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <View style={chipStyles.row}>
      <View style={[chipStyles.label, { backgroundColor: accent }]}>
        <Text style={chipStyles.labelText}>{label}</Text>
      </View>
      <View style={chipStyles.value}>
        <Text style={chipStyles.valueText}>{value}</Text>
      </View>
    </View>
  );
}

function RecordCell({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={recStyles.cell}>
      <Text style={[recStyles.value, { color }]}>{value}</Text>
      <Text style={recStyles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: {
    flexDirection: "row",
    paddingHorizontal: 6,
    paddingTop: 4,
    paddingBottom: 2,
  },
  col: {
    gap: 5,
  },
  center: {
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 4,
  },
  nameWrap: {
    height: 30,
    justifyContent: "center",
  },
  panel: {
    backgroundColor: "rgba(246, 232, 190, 0.9)",
    borderWidth: 2,
    borderColor: "#7a4a25",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 6,
    flex: 1,
  },
  panelTitle: {
    color: "#7a1f1f",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1.4,
    textAlign: "center",
    marginBottom: 5,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "space-between",
  },
  xpWrap: {
    backgroundColor: "rgba(246, 232, 190, 0.9)",
    borderWidth: 1.5,
    borderColor: "#7a4a25",
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  xpLabel: { color: "#3a2812", fontWeight: "900", fontSize: 11 },
  xpBar: {
    height: 7,
    backgroundColor: "#7a4a25",
    borderRadius: 2,
    marginTop: 3,
    overflow: "hidden",
  },
  xpFill: { height: "100%", backgroundColor: "#3a8c3a" },
  xpText: { color: "#3a2812", fontWeight: "700", fontSize: 9 },
  recordRow: {
    flexDirection: "row",
    backgroundColor: "rgba(246, 232, 190, 0.9)",
    borderWidth: 1.5,
    borderColor: "#7a4a25",
    borderRadius: 5,
    overflow: "hidden",
  },
  nameRow: {
    backgroundColor: "rgba(246, 232, 190, 0.9)",
    borderWidth: 1.5,
    borderColor: "#7a4a25",
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: "center",
  },
  nameText: {
    color: "#3a2812",
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 0.4,
  },
  classText: {
    color: "#7a4a25",
    fontWeight: "700",
    fontSize: 12,
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
    gap: 2,
  },
  equipLabel: {
    color: "#7a4a25",
    fontWeight: "800",
    fontSize: 8,
    letterSpacing: 0.3,
  },
  petSlot: {
    backgroundColor: "#f6e8be",
    borderWidth: 2.5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  petFallback: {
    opacity: 0.4,
  },
  resetBtn: {
    backgroundColor: "rgba(122, 30, 30, 0.7)",
    borderRadius: 4,
    paddingVertical: 5,
    alignItems: "center",
  },
  resetText: {
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 10,
    letterSpacing: 1,
  },
});

const chipStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    height: 26,
    width: "48%",
    borderWidth: 1.5,
    borderColor: "#7a4a25",
    borderRadius: 5,
    overflow: "hidden",
  },
  label: {
    paddingHorizontal: 6,
    minWidth: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.6,
  },
  value: {
    backgroundColor: "#fff8d8",
    flex: 1,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    color: "#3a2812",
    fontWeight: "900",
    fontSize: 13,
  },
});

const recStyles = StyleSheet.create({
  cell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
    borderRightWidth: 1,
    borderRightColor: "rgba(122, 74, 37, 0.4)",
  },
  value: {
    fontWeight: "900",
    fontSize: 14,
  },
  label: {
    color: "#7a4a25",
    fontWeight: "800",
    fontSize: 9,
    letterSpacing: 0.5,
  },
});
