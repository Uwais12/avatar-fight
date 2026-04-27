import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";

import { useGame } from "../lib/store";
import { theme } from "../lib/theme";
import { Parchment } from "../components/Parchment";
import { StatRow } from "../components/StatRow";
import { Avatar } from "../components/Avatar";
import { equipBonus, TIER_NAME } from "../lib/data";
import { TIER_NAMES, TIER_COLORS } from "../lib/types";
import { totalStats, SLOTS } from "../lib/game";
import type { EquipSlot } from "../lib/types";

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

export default function Equipment() {
  const player = useGame((s) => s.player);
  const stats = totalStats(player);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Avatar seed={player.avatarSeed} style={player.avatarStyle} size={100} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.subtle}>Level {player.level}</Text>
          <View style={{ marginTop: 6 }}>
            <StatRow icon="⚔️" label="STR" value={stats.str} />
            <StatRow icon="🛡️" label="AGL" value={stats.agl} />
            <StatRow icon="👟" label="SPD" value={stats.spd} />
            <StatRow icon="❤️" label="HP" value={stats.hp} />
          </View>
        </View>
      </View>

      <Parchment style={{ marginTop: 12 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EQUIPPED</Text>
          {SLOTS.map((slot) => {
            const eq = player.equipment[slot];
            const tier = eq?.tier ?? 0;
            return (
              <View key={slot} style={styles.slotRow}>
                <Text style={styles.slotIcon}>{SLOT_ICONS[slot]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.slotLabel}>{SLOT_LABELS[slot]}</Text>
                  <Text style={[styles.slotName, { color: TIER_COLORS[tier] }]}>
                    {eq ? eq.name : "(empty)"}
                  </Text>
                </View>
                <View style={[styles.tierBadge, { backgroundColor: TIER_COLORS[tier] }]}>
                  <Text style={styles.tierText}>{TIER_NAMES[tier]}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </Parchment>

      <Text style={styles.tip}>Visit the Forge to upgrade your gear.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    backgroundColor: theme.parchment,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "900",
    color: theme.ink,
  },
  subtle: {
    fontSize: 13,
    color: theme.inkLight,
    fontWeight: "700",
  },
  section: { padding: 12 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
    color: theme.ink,
    marginBottom: 8,
  },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.parchmentDark,
  },
  slotIcon: {
    fontSize: 24,
    width: 32,
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
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.woodDark,
  },
  tierText: {
    fontSize: 11,
    fontWeight: "900",
    color: theme.ink,
    letterSpacing: 0.5,
  },
  tip: {
    textAlign: "center",
    color: theme.inkLight,
    fontSize: 13,
    marginTop: 16,
  },
});
