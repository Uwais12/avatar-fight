import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../lib/theme";

type Props = {
  label: string;
  current: number;
  max: number;
  reverse?: boolean;
};

export function HpBar({ label, current, max, reverse }: Props) {
  const pct = Math.max(0, Math.min(1, current / Math.max(1, max)));
  return (
    <View style={[styles.outer, reverse && styles.outerReverse]}>
      <View style={styles.barOuter}>
        <View style={[styles.barFill, { width: `${pct * 100}%` }]} />
        <Text style={styles.barLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  outerReverse: {
    justifyContent: "flex-end",
  },
  barOuter: {
    flex: 1,
    height: 22,
    backgroundColor: "#5a2a1a",
    borderWidth: 2,
    borderColor: "#3a1810",
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "center",
  },
  barFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.banner,
  },
  barLabel: {
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
    paddingLeft: 8,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
