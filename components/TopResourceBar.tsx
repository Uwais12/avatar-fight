import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../lib/theme";
import { useGame } from "../lib/store";
import type { Player } from "../lib/types";

type Props = {
  player?: Player;
  title?: string;
};

export function TopResourceBar({ player: playerProp, title }: Props) {
  const playerStore = useGame((s) => s.player);
  const player = playerProp ?? playerStore;
  const router = useRouter();
  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <View style={styles.lvBadge}>
          <Text style={styles.lvText}>Lv {player.level}</Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>{title ?? player.name}</Text>
      </View>
      <View style={styles.right}>
        <View style={styles.res}>
          <Text style={[styles.resIcon, { color: "#d4a23a" }]}>🪙</Text>
          <Text style={styles.resVal}>{player.gold}</Text>
        </View>
        <View style={styles.res}>
          <Text style={[styles.resIcon, { color: "#4080c8" }]}>💎</Text>
          <Text style={styles.resVal}>{player.crystals}</Text>
        </View>
        <Pressable onPress={() => router.push("/me")} style={styles.gear}>
          <Text style={{ fontSize: 16 }}>⚙</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.parchmentDark,
    borderBottomWidth: 3,
    borderBottomColor: theme.woodDark,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  lvBadge: {
    backgroundColor: theme.banner,
    borderWidth: 2,
    borderColor: theme.bannerDark,
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  lvText: { color: "#fff8d8", fontWeight: "900", fontSize: 12, letterSpacing: 0.5 },
  name: { color: theme.ink, fontWeight: "900", fontSize: 16, flexShrink: 1 },
  right: { flexDirection: "row", alignItems: "center", gap: 12 },
  res: { flexDirection: "row", alignItems: "center", gap: 4 },
  resIcon: { fontSize: 14 },
  resVal: { color: theme.ink, fontWeight: "900", fontSize: 14 },
  gear: {
    width: 30, height: 30,
    backgroundColor: theme.parchmentLight,
    borderWidth: 2, borderColor: theme.woodDark,
    borderRadius: 6,
    alignItems: "center", justifyContent: "center",
  },
});
