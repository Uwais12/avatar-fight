import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

type Props = {
  label: string;
  icon?: string;
  width?: number;
  height?: number;
  style?: ViewStyle;
  notchSide?: "right" | "left";
};

export function PennantBanner({ label, icon, width = 70, height = 26, style, notchSide = "right" }: Props) {
  const notchDepth = 8;
  const path =
    notchSide === "right"
      ? `M0,0 L${width - notchDepth},0 L${width},${height / 2} L${width - notchDepth},${height} L0,${height} Z`
      : `M${notchDepth},0 L${width},0 L${width},${height} L${notchDepth},${height} L0,${height / 2} Z`;

  return (
    <View style={[{ width, height }, style]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="pen" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#c44030" />
            <Stop offset="0.5" stopColor="#a82820" />
            <Stop offset="1" stopColor="#7a1810" />
          </LinearGradient>
        </Defs>
        <Path d={path} fill="url(#pen)" stroke="#5a0e08" strokeWidth="1.5" />
      </Svg>
      <View style={[styles.content, { width: width - notchDepth, paddingLeft: notchSide === "left" ? notchDepth : 6 }]}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    gap: 4,
  },
  icon: {
    fontSize: 11,
    color: "#fff8d8",
  },
  label: {
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
