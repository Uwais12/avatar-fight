import React from "react";
import { Pressable, Text, View, StyleSheet, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  width?: number;
  height?: number;
  style?: ViewStyle;
};

export function SideButton({ label, onPress, disabled, width = 44, height = 110, style }: Props) {
  const press = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.();
  };
  const fontSize = label.length > 8 ? 16 : label.length > 6 ? 18 : 22;
  return (
    <Pressable
      onPress={press}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { width, height },
        pressed && !disabled && styles.btnPressed,
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <View
        style={[
          styles.rotatedWrap,
          {
            width: height,
            height: width,
            left: width / 2 - height / 2,
            top: height / 2 - width / 2,
          },
        ]}
      >
        <Text
          style={[styles.label, { fontSize }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.4}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#f0dba0",
    borderColor: "#7a4a25",
    borderWidth: 2.5,
    borderRadius: 8,
    shadowColor: "rgba(58,32,12,0.6)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    overflow: "hidden",
  },
  btnPressed: {
    transform: [{ translateY: 1 }],
    backgroundColor: "#e0c890",
  },
  rotatedWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-90deg" }],
  },
  label: {
    fontWeight: "900",
    color: "#5a3812",
    textAlign: "center",
    letterSpacing: 1,
  },
});
