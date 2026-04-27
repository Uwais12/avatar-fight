import React from "react";
import { View, ViewStyle, StyleProp } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParchmentBg } from "./ParchmentBg";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  noBg?: boolean;
};

/**
 * Landscape-aware screen wrapper that applies safe area insets so content
 * doesn't sit under the notch (left edge in landscape-right) or home indicator (right edge / bottom).
 */
export function Screen({ children, style, noBg }: Props) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };
  if (noBg) {
    return <View style={[{ flex: 1 }, padding, style]}>{children}</View>;
  }
  return (
    <ParchmentBg style={[padding, style]}>
      {children}
    </ParchmentBg>
  );
}
