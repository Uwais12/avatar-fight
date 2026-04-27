import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { theme } from "../lib/theme";
import { TIER_COLORS, TIER_NAMES } from "../lib/types";
import type { Equipment } from "../lib/types";
import { WEAPON_ASSETS, ARMOR_ASSETS } from "../lib/assets";

type Props = {
  slot: string;
  equipment: Equipment | null;
  size?: number;
  onPress?: () => void;
};

const SLOT_FALLBACK_ICON: Record<string, string> = {
  weapon: "⚔️",
  helmet: "🪖",
  chest: "🥋",
  gloves: "🧤",
  boots: "🥾",
  accessory: "💍",
};

const SLOT_TO_ASSET_KEY: Record<string, string> = {
  weapon: "sword",
  helmet: "helm",
  chest: "chest",
  boots: "boots",
};

export function EquipmentSlot({ slot, equipment, size = 56, onPress }: Props) {
  const tier = equipment?.tier ?? 0;
  const borderColor = equipment ? TIER_COLORS[tier] : theme.woodDark;

  const assetKey = SLOT_TO_ASSET_KEY[slot];
  const isWeapon = slot === "weapon";
  const isArmorish = ["helmet", "chest", "boots"].includes(slot);
  const asset = equipment && isWeapon ? WEAPON_ASSETS[assetKey] : equipment && isArmorish ? ARMOR_ASSETS[assetKey] : null;

  return (
    <Pressable onPress={onPress} style={[styles.slot, { width: size, height: size, borderColor }]}>
      {asset ? (
        <Image source={asset} style={{ width: size - 8, height: size - 8 }} contentFit="contain" />
      ) : (
        <Text style={[styles.fallbackIcon, { fontSize: size * 0.5, opacity: equipment ? 1 : 0.4 }]}>
          {SLOT_FALLBACK_ICON[slot]}
        </Text>
      )}
      {equipment && (
        <View style={[styles.tierTag, { backgroundColor: TIER_COLORS[tier] }]}>
          <Text style={styles.tierText}>T{tier}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    backgroundColor: "#f6e8be",
    borderWidth: 2.5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  fallbackIcon: {
    color: theme.inkLight,
  },
  tierTag: {
    position: "absolute",
    bottom: 0,
    right: 0,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.woodDark,
  },
  tierText: {
    color: theme.ink,
    fontWeight: "900",
    fontSize: 9,
  },
});
