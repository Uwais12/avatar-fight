import React from "react";
import { Text, View, StyleSheet, ViewStyle } from "react-native";

const SPRITE_EMOJI: Record<string, string> = {
  "dragon-red": "🐉",
  "dragon-blue": "🐲",
  "dragon-purple": "🐉",
  "dragon-green": "🐲",
  wolf: "🐺",
  cat: "🐱",
  boar: "🐗",
  fox: "🦊",
  golem: "🗿",
  bird: "🦅",
};

type Props = {
  spriteKey: string;
  size?: number;
  flip?: boolean;
  style?: ViewStyle;
};

export function PetSprite({ spriteKey, size = 64, flip, style }: Props) {
  const glyph = SPRITE_EMOJI[spriteKey] ?? "🐲";
  return (
    <View style={[styles.box, { width: size, height: size }, style]}>
      <Text style={[styles.glyph, { fontSize: size * 0.86, transform: flip ? [{ scaleX: -1 }] : undefined }]}>{glyph}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
  },
  glyph: {
    textAlign: "center",
  },
});
