import React from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import * as Haptics from "expo-haptics";

import { useGame } from "../lib/store";
import { theme } from "../lib/theme";
import { Parchment } from "../components/Parchment";
import { WoodButton } from "../components/WoodButton";
import { equipBonus, makeEquipment } from "../lib/data";
import { TIER_NAMES, TIER_COLORS } from "../lib/types";
import { tierUpgradeCost, SLOTS } from "../lib/game";
import type { EquipSlot, Tier } from "../lib/types";

const SLOT_ICONS: Record<EquipSlot, string> = {
  weapon: "⚔️",
  helmet: "🪖",
  chest: "🥋",
  gloves: "🧤",
  boots: "🥾",
  accessory: "💍",
};

const SLOT_LABELS: Record<EquipSlot, string> = {
  weapon: "Weapon",
  helmet: "Helmet",
  chest: "Chest",
  gloves: "Gloves",
  boots: "Boots",
  accessory: "Accessory",
};

export default function Shop() {
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
      Alert.alert("Not enough", `Need ${cost.gold} 💰 and ${cost.crystals} 💎`);
      return;
    }
    updatePlayer((p) => ({ ...p, gold: p.gold - cost.gold, crystals: p.crystals - cost.crystals }));
    const nextTier = (curTier + 1) as Tier;
    setEquipment(slot, makeEquipment(slot, nextTier));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.coinRow}>
        <Text style={styles.coin}>💰 {player.gold}</Text>
        <Text style={styles.coin}>💎 {player.crystals}</Text>
      </View>

      {SLOTS.map((slot) => {
        const eq = player.equipment[slot];
        const curTier = (eq?.tier ?? 0) as Tier;
        const cost = tierUpgradeCost(curTier);
        const nextTier = (curTier + 1) as Tier;
        const canAfford = player.gold >= cost.gold && player.crystals >= cost.crystals;
        const maxed = curTier >= 5;
        return (
          <Parchment key={slot} style={{ marginBottom: 10 }}>
            <View style={styles.row}>
              <Text style={styles.slotIcon}>{SLOT_ICONS[slot]}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.slotLabel}>{SLOT_LABELS[slot]}</Text>
                <Text style={[styles.slotName, { color: TIER_COLORS[curTier] }]}>
                  {eq ? eq.name : "(empty)"}
                </Text>
                {!maxed && (
                  <Text style={styles.upgradeHint}>
                    → {TIER_NAMES[nextTier]}  ({cost.gold} 💰{cost.crystals ? ` + ${cost.crystals} 💎` : ""})
                  </Text>
                )}
              </View>
              <WoodButton
                small
                label={maxed ? "MAX" : "UPGRADE"}
                onPress={() => upgrade(slot)}
                disabled={maxed || !canAfford}
              />
            </View>
          </Parchment>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    backgroundColor: theme.parchment,
    paddingBottom: 40,
  },
  coinRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
    justifyContent: "center",
  },
  coin: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.ink,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
  },
  slotIcon: {
    fontSize: 28,
    width: 36,
    textAlign: "center",
  },
  slotLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.inkLight,
    letterSpacing: 0.8,
  },
  slotName: {
    fontSize: 15,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  upgradeHint: {
    fontSize: 12,
    color: theme.inkLight,
    fontWeight: "700",
    marginTop: 2,
  },
});
