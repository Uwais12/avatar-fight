import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../lib/theme";

type Props = {
  icon: string;
  label: string;
  value: string | number;
  accent?: string;
};

export function StatRow({ icon, label, value, accent = theme.bannerDark }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.label, { backgroundColor: accent }]}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 3,
  },
  label: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 80,
  },
  icon: { fontSize: 13 },
  labelText: {
    color: "#fff8d8",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 1,
  },
  value: {
    color: theme.ink,
    fontWeight: "800",
    fontSize: 18,
  },
});
