import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { useGame } from "../../lib/store";
import { Avatar } from "../../components/Avatar";
import { PetSprite } from "../../components/PetSprite";
import { ParchmentBg } from "../../components/ParchmentBg";
import { PennantBanner } from "../../components/PennantBanner";
import { CornerButton } from "../../components/CornerButton";
import { simulateBattle, totalStats, SLOTS } from "../../lib/game";
import { TIER_NAMES } from "../../lib/types";
import type { Player, EquipSlot } from "../../lib/types";

const SLOT_ICON: Record<EquipSlot, string> = {
  weapon: "⚔️",
  helmet: "🪖",
  chest: "🥋",
  gloves: "🧤",
  boots: "🥾",
  accessory: "💍",
};

export default function ProfileDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const player = useGame((s) => s.player);
  const opponents = useGame((s) => s.opponents);
  const setLastBattle = useGame((s) => s.setLastBattle);
  const updatePlayer = useGame((s) => s.updatePlayer);

  const target = opponents.find((o) => o.id === id);
  if (!target) {
    return (
      <ParchmentBg style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Profile not found</Text>
        <CornerButton label="✕" size={40} fontSize={20} onPress={() => router.back()} />
      </ParchmentBg>
    );
  }

  const stats = totalStats(target);
  const winRate = target.wins + target.losses > 0
    ? Math.round((target.wins / (target.wins + target.losses)) * 100) : 0;

  const handleLoot = () => {
    const gold = Math.floor(target.level * 18 + Math.random() * 30);
    const crystals = Math.random() < 0.5 ? 1 : 0;
    updatePlayer((p) => ({ ...p, gold: p.gold + gold, crystals: p.crystals + crystals }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert("Looted!", `+${gold} gold${crystals ? ` +${crystals} crystal` : ""}`);
  };

  const handleFight = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const r = simulateBattle(player, target);
    setLastBattle({ winner: r.winner, events: r.events, opponentName: target.name, opponentLevel: target.level });
    router.replace("/battle");
  };

  return (
    <ParchmentBg style={styles.root}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.lvBadge}>[Lv {target.level}]</Text>
          <Text style={styles.dot}> ●  </Text>
          <Text style={styles.name}>{target.name}</Text>
        </View>
        <CornerButton label="✕" size={32} fontSize={16} onPress={() => router.back()} />
      </View>

      <View style={styles.body}>
        <View style={styles.leftSide}>
          <ScrollView contentContainerStyle={{ gap: 6 }} showsVerticalScrollIndicator={false}>
            <View style={styles.statGrid}>
              <View style={styles.statCell}>
                <PennantBanner icon="⚔️" label="STR" width={70} height={22} />
                <Text style={styles.statVal}>{stats.str}</Text>
              </View>
              <View style={styles.statCell}>
                <PennantBanner icon="🛡️" label="AGL" width={70} height={22} />
                <Text style={styles.statVal}>{stats.agl}</Text>
              </View>
              <View style={styles.statCell}>
                <PennantBanner icon="👟" label="SPD" width={70} height={22} />
                <Text style={styles.statVal}>{stats.spd}</Text>
              </View>
              <View style={styles.statCell}>
                <PennantBanner icon="❤️" label="HP" width={70} height={22} />
                <Text style={styles.statVal}>{stats.hp}</Text>
              </View>
              <View style={styles.statCell}>
                <PennantBanner icon="🏆" label="WIN" width={70} height={22} />
                <Text style={styles.statVal}>{winRate}%</Text>
              </View>
            </View>

            {target.guild && (
              <View style={styles.guildRow}>
                <Text style={styles.guildIcon}>👑</Text>
                <Text style={styles.guildName}>{target.guild}</Text>
              </View>
            )}

            <View style={styles.equipGrid}>
              {SLOTS.map((slot) => {
                const eq = target.equipment[slot];
                return (
                  <View key={slot} style={styles.equipCell}>
                    <Text style={styles.equipIcon}>{SLOT_ICON[slot]}</Text>
                    <Text style={styles.equipTier}>{eq ? `T${eq.tier}` : "—"}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={styles.rightSide}>
          {target.pet && (
            <PetSprite spriteKey={target.pet.spriteKey} size={150} style={{ marginRight: -20 }} />
          )}
          <Avatar seed={target.avatarSeed} style={target.avatarStyle} size={170} framed={false} />
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.bottomBtn} onPress={handleLoot}>
          <Text style={styles.bottomLabel}>👑 LOOT</Text>
        </Pressable>
        <Pressable style={styles.bottomBtn} onPress={handleFight}>
          <Text style={styles.bottomLabel}>FIGHT</Text>
        </Pressable>
        <Pressable style={styles.bottomBtn} onPress={() => Alert.alert("Friend", `Sent friend request to ${target.name}`)}>
          <Text style={styles.bottomLabel}>+FRIEND</Text>
        </Pressable>
        <Pressable style={styles.bottomBtn} onPress={() => Alert.alert("Message", `Mail to ${target.name} (offline)`)}>
          <Text style={styles.bottomLabel}>+MSG</Text>
        </Pressable>
      </View>
    </ParchmentBg>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  lvBadge: {
    fontSize: 14,
    fontWeight: "900",
    color: "#5a3812",
  },
  dot: {
    fontSize: 14,
    color: "#a06a3e",
    fontWeight: "900",
  },
  name: {
    fontSize: 18,
    fontWeight: "900",
    color: "#5a3812",
  },
  body: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
  },
  leftSide: {
    flex: 1.1,
  },
  rightSide: {
    flex: 0.9,
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "row",
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  statCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: "48%",
  },
  statVal: {
    fontSize: 14,
    fontWeight: "900",
    color: "#5a3812",
  },
  guildRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginVertical: 2,
  },
  guildIcon: { fontSize: 14 },
  guildName: {
    fontSize: 13,
    color: "#3a5882",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  equipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  equipCell: {
    width: 42,
    height: 42,
    backgroundColor: "#f6e8be",
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#7a4a25",
    alignItems: "center",
    justifyContent: "center",
  },
  equipIcon: { fontSize: 18 },
  equipTier: { fontSize: 9, fontWeight: "800", color: "#7a4a25" },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  bottomBtn: {
    flex: 1,
    backgroundColor: "#f0dba0",
    borderColor: "#7a4a25",
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(58,32,12,0.5)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  bottomLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: "#5a3812",
    letterSpacing: 0.8,
  },
});
