import React from "react";
import { Pressable, Text, View, StyleSheet, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  size?: number;
  width?: number;
  height?: number;
  fontSize?: number;
  style?: ViewStyle;
  vertical?: boolean;
};

export function CornerButton({ label, onPress, disabled, size = 44, width, height, fontSize, style, vertical }: Props) {
  const w = width ?? size;
  const h = height ?? size;
  const fs = fontSize ?? (label.length > 5 ? 14 : 18);

  if (vertical) {
    return (
      <Pressable
        onPress={() => {
          if (disabled) return;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onPress?.();
        }}
        disabled={disabled}
        style={({ pressed }) => [
          styles.btn,
          { width: w, height: h },
          pressed && !disabled && styles.pressed,
          disabled && { opacity: 0.5 },
          style,
        ]}
      >
        <View
          style={[
            styles.rotatedWrap,
            {
              width: h,
              height: w,
              left: w / 2 - h / 2,
              top: h / 2 - w / 2,
            },
          ]}
        >
          <Text
            style={[styles.label, { fontSize: fs }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.();
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { width: w, height: h },
        pressed && !disabled && styles.pressed,
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text style={[styles.label, { fontSize: fs }]} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#f0dba0",
    borderColor: "#7a4a25",
    borderWidth: 2.5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "rgba(58,32,12,0.6)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  pressed: {
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
    letterSpacing: 1,
    textAlign: "center",
  },
});
