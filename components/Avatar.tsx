import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Image } from "expo-image";
import type { AvatarStyle } from "../lib/types";
import { theme } from "../lib/theme";

type Props = {
  seed: string;
  style?: AvatarStyle;
  size?: number;
  containerStyle?: ViewStyle;
  framed?: boolean;
};

export function avatarUrl(seed: string, style: AvatarStyle = "lorelei", size = 256) {
  const safeSeed = encodeURIComponent(seed || "hero");
  return `https://api.dicebear.com/9.x/${style}/png?seed=${safeSeed}&size=${size}&backgroundType=solid&backgroundColor=f4e7c5,ecdcb1,e9d4a3`;
}

export function Avatar({ seed, style = "lorelei", size = 64, containerStyle, framed = true }: Props) {
  const url = avatarUrl(seed, style, size * 2);
  const inner = (
    <Image
      source={url}
      style={{ width: size, height: size, borderRadius: framed ? 6 : size / 2 }}
      contentFit="cover"
      transition={150}
      cachePolicy="memory-disk"
    />
  );
  if (!framed) return <View style={containerStyle}>{inner}</View>;
  return (
    <View style={[styles.frame, { padding: 2 }, containerStyle]}>
      <View style={[styles.frameInner, { borderRadius: 7 }]}>{inner}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: theme.woodDark,
    borderRadius: 9,
    padding: 2,
  },
  frameInner: {
    backgroundColor: theme.parchmentLight,
    overflow: "hidden",
  },
});
