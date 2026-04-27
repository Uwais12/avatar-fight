import React from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { useGame } from "../lib/store";
import { theme } from "../lib/theme";
import { ParchmentBg } from "../components/ParchmentBg";
import { TopResourceBar } from "../components/TopResourceBar";
import { BottomNav } from "../components/BottomNav";
import { EquipmentSlot } from "../components/EquipmentSlot";
import { makeEquipment } from "../lib/data";
import { TIER_NAMES, TIER_COLORS } from "../lib/types";
import { tierUpgradeCost, SLOTS } from "../lib/game";
import type { EquipSlot, Tier } from "../lib/types";

const SLOT_LABEL: Record<EquipSlot, string> = {
  weapon: "Weapon",
  helmet: "Helmet",
  chest: "Chest",
  gloves: "Gloves",
  boots: "Boots",
  accessory: "Accessory",
};

export default function Shop() {
  const insets = useSafeAreaInsets();
  const player = useGame((s) => s.player);
  const setEquipment = useGame((s) => s.setEquipment);
  const updatePlayer = useGame((s) => s.updatePlayer);

  const upgrade = (slot: EquipSlot) => {
    const cur = player.equipment[slot];
    const curTier = (cur?.tier ?? 0) as Tier;
    if (curTier >= 5) {
      Alert.alert("Maxed out", "Already at Supreme tier.");
      return;
    }
    const cost = tierUpgradeCost(curTier);
    if (player.gold < cost.gold || player.crystals < cost.crystals) {
      Alert.alert("Not enough", `Need ${cost.gold} 🪙 and ${cost.crystals} 💎`);
      return;
    }
    updatePlayer((p) => ({ ...p, gold: p.gold - cost.gold, crystals: p.crystals - cost.crystals }));
    const nextTier = (curTier + 1) as Tier;
    setEquipment(slot, makeEquipment(slot, nextTier));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  return (
    <ParchmentBg style={[styles.root, { paddingTop: insets.top }]}>
      <TopResourceBar player={player} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.h1}>FORGE / SHOP</Text>

        {SLOTS.map((slot) => {
          const eq = player.equipment[slot];
          const curTier = (eq?.tier ?? 0) as Tier;
          const cost = tierUpgradeCost(curTier);
          const nextTier = (curTier + 1) as Tier;
          const canAfford = player.gold >= cost.gold && player.crystals >= cost.crystals;
          const maxed = curTier >= 5;
          return (
            <View key={slot} style={styles.row}>
              <EquipmentSlot slot={slot} equipment={eq} size={56} />
              <View style={{ flex: 1 }}>
                <Text style={styles.slotLabel}>{SLOT_LABEL[slot]}</Text>
                <Text style={[styles.itemName, { color: TIER_COLORS[curTier] }]}>
                  {eq ? eq.name : "(empty)"}
                </Text>
                {!maxed && (
                  <Text style={styles.upgradeHint}>
                    → {TIER_NAMES[nextTier]}  {cost.gold} 🪙{cost.crystals ? ` + ${cost.crystals} 💎` : ""}
                  </Text>
                )}
              </View>
              <Pressable
                style={[styles.upgradeBtn, (maxed || !canAfford) && styles.upgradeBtnDisabled]}
                onPress={() => upgrade(slot)}
                disabled={maxed || !canAfford}
              >
                <Text style={styles.upgradeLabel}>{maxed ? "MAX" : "UPGRADE"}</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
      <BottomNav />
      <View style={{ height: insets.bottom, backgroundColor: theme.parchmentDark }} />
    </ParchmentBg>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 12, gap: 8, paddingBottom: 24 },
  h1: { fontSize: 18, fontWeight: "900", color: theme.ink, letterSpacing: 1, marginBottom: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f6e8be",
    borderWidth: 2,
    borderColor: theme.woodDark,
    borderRadius: 8,
    padding: 8,
  },
  slotLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.inkLight,
    letterSpacing: 0.8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  upgradeHint: {
    fontSize: 11,
    color: theme.inkLight,
    fontWeight: "700",
    marginTop: 2,
  },
  upgradeBtn: {
    backgroundColor: theme.banner,
    borderWidth: 2,
    borderColor: theme.bannerDark,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  upgradeBtnDisabled: { opacity: 0.4 },
  upgradeLabel: {
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.8,
  },
});
