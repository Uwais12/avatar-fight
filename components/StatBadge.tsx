import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../lib/theme";

type Props = {
  label: string;
  value: string | number;
  width?: number;
  accent?: string;
};

export function StatBadge({ label, value, width, accent }: Props) {
  return (
    <View style={[styles.row, width ? { width } : null]}>
      <View style={[styles.labelBox, { backgroundColor: accent ?? theme.banner }]}>
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <View style={styles.valueBox}>
        <Text style={styles.valueText}>{value}</Text>
      </View>
    </View>
  );
}

export function PowerBox({ power, value }: { power?: number; value?: number | string }) {
  const display = power ?? value ?? 0;
  return (
    <View style={pwrStyles.box}>
      <Text style={pwrStyles.label}>POWER</Text>
      <Text style={pwrStyles.value}>{typeof display === "number" ? display.toLocaleString() : display}</Text>
    </View>
  );
}

const pwrStyles = StyleSheet.create({
  box: {
    borderWidth: 3,
    borderColor: "#d4a23a",
    backgroundColor: "#f6e8be",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: "center",
  },
  label: { color: "#a87838", fontWeight: "900", fontSize: 11, letterSpacing: 1.5 },
  value: { color: theme.ink, fontWeight: "900", fontSize: 22 },
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    height: 30,
    borderWidth: 2,
    borderColor: theme.woodDark,
    borderRadius: 6,
    overflow: "hidden",
  },
  labelBox: {
    paddingHorizontal: 10,
    minWidth: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  valueBox: {
    backgroundColor: "#f6e8be",
    flex: 1,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
  },
  valueText: {
    color: theme.ink,
    fontWeight: "900",
    fontSize: 16,
  },
});
