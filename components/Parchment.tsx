import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { theme } from "../lib/theme";

export function Parchment({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[styles.outer, style]} {...rest}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

export function Panel({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[styles.panel, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: theme.woodDark,
    borderRadius: 12,
    padding: 3,
  },
  inner: {
    backgroundColor: theme.parchment,
    borderRadius: 9,
    overflow: "hidden",
  },
  panel: {
    backgroundColor: theme.cardBg,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.woodDark,
    padding: 10,
  },
});
