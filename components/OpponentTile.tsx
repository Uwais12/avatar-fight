import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { avatarUrl } from "./Avatar";
import type { Player } from "../lib/types";

type Props = {
  opponent: Player;
  selected?: boolean;
  onPress: () => void;
  width?: number;
  height?: number;
};

export function OpponentTile({ opponent, selected, onPress, width = 84, height = 60 }: Props) {
  const url = avatarUrl(opponent.avatarSeed, opponent.avatarStyle, 160);
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tile, { width, height }, selected && styles.selected]}
    >
      <View style={styles.lvBadge}>
        <Text style={styles.lvText}>Lv{opponent.level}</Text>
      </View>
      <Image
        source={url}
        style={[StyleSheet.absoluteFill, styles.image]}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: "#f0dba0",
    borderColor: "#7a4a25",
    borderWidth: 2,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
    shadowColor: "rgba(58,32,12,0.5)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  selected: {
    borderColor: "#a82820",
    borderWidth: 3,
  },
  lvBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(225, 200, 140, 0.92)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderBottomRightRadius: 4,
    zIndex: 2,
  },
  lvText: {
    color: "#5a3812",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  image: {
    zIndex: 1,
  },
});
