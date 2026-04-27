import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../lib/theme";

export function PowerBox({ power }: { power: number }) {
  return (
    <View style={styles.box}>
      <Text style={styles.label}>POWER</Text>
      <Text style={styles.value}>{power.toLocaleString()}</Text>
    </View>
  );
}

export function XpBar({ level, xp, xpFor }: { level: number; xp: number; xpFor: number }) {
  const pct = Math.max(0, Math.min(1, xp / xpFor));
  return (
    <View style={styles.xpRow}>
      <Text style={styles.xpLabel}>Lv {level}</Text>
      <View style={styles.xpBarOuter}>
        <View style={[styles.xpFill, { width: `${pct * 100}%` }]} />
        <Text style={styles.xpText}>{xp} / {xpFor}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 3,
    borderColor: "#d4a23a",
    backgroundColor: "#f6e8be",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: "center",
  },
  label: {
    color: "#a87838",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  value: {
    color: theme.ink,
    fontWeight: "900",
    fontSize: 22,
  },
  xpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  xpLabel: {
    color: theme.ink,
    fontWeight: "900",
    fontSize: 12,
  },
  xpBarOuter: {
    flex: 1,
    height: 18,
    backgroundColor: "#5a3812",
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#3a2010",
    overflow: "hidden",
    justifyContent: "center",
  },
  xpFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#a8d048",
  },
  xpText: {
    paddingHorizontal: 8,
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 11,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
