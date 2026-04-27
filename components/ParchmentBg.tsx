import React from "react";
import Svg, { Defs, Pattern, Rect, Path, LinearGradient, Stop } from "react-native-svg";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  noInsets?: boolean;
};

export function ParchmentBg({ children, style, noInsets }: Props) {
  const insets = useSafeAreaInsets();
  const insetStyle: ViewStyle = noInsets ? {} : {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };
  return (
    <View style={[styles.container, insetStyle, style]}>
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="xMidYMid slice">
        <Defs>
          <Pattern id="weave" patternUnits="userSpaceOnUse" width="18" height="18">
            <Rect width="18" height="18" fill="#e7d29c" />
            <Rect x="0" y="0" width="9" height="9" fill="#dcc380" opacity="0.55" />
            <Rect x="9" y="9" width="9" height="9" fill="#dcc380" opacity="0.55" />
            <Path d="M0 4.5 L18 4.5" stroke="#c8a958" strokeWidth="0.4" opacity="0.35" />
            <Path d="M0 13.5 L18 13.5" stroke="#c8a958" strokeWidth="0.4" opacity="0.35" />
            <Path d="M4.5 0 L4.5 18" stroke="#c8a958" strokeWidth="0.4" opacity="0.35" />
            <Path d="M13.5 0 L13.5 18" stroke="#c8a958" strokeWidth="0.4" opacity="0.35" />
            <Rect x="3" y="3" width="3" height="3" fill="#b08840" opacity="0.35" />
            <Rect x="12" y="12" width="3" height="3" fill="#b08840" opacity="0.35" />
          </Pattern>
          <LinearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity="0" />
            <Stop offset="0.5" stopColor="#000000" stopOpacity="0" />
            <Stop offset="1" stopColor="#7a4a25" stopOpacity="0.18" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#weave)" />
        <Rect width="100%" height="100%" fill="url(#vignette)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e7d29c",
  },
});
