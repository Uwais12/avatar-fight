import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, View } from "react-native";
import * as Haptics from "expo-haptics";
import { theme } from "../lib/theme";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger" | "side";
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  small?: boolean;
};

export function WoodButton({ label, onPress, variant = "primary", disabled, style, textStyle, small }: Props) {
  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.();
  };

  const palette =
    variant === "primary"
      ? { bg: theme.parchmentLight, border: theme.woodDark, text: theme.ink }
      : variant === "danger"
      ? { bg: theme.banner, border: theme.bannerDark, text: "#fff8d8" }
      : variant === "side"
      ? { bg: theme.parchmentLight, border: theme.woodDark, text: theme.ink }
      : { bg: theme.parchment, border: theme.wood, text: theme.ink };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        { backgroundColor: palette.bg, borderColor: palette.border },
        pressed && !disabled && styles.btnPressed,
        disabled && styles.btnDisabled,
        style,
      ]}
    >
      <View style={styles.btnInner}>
        <Text style={[styles.label, small && styles.labelSmall, { color: palette.text }, textStyle]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 2.5,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: 88,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  btnSmall: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    minWidth: 0,
  },
  btnInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  btnPressed: {
    transform: [{ translateY: 1 }],
    shadowOpacity: 0.4,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  labelSmall: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
