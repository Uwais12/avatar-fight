import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Polygon, Ellipse } from "react-native-svg";

type Props = {
  spriteKey: string;
  size?: number;
  flip?: boolean;
  style?: ViewStyle;
};

export function PetSprite({ spriteKey, size = 64, flip, style }: Props) {
  const palette = PALETTES[spriteKey] ?? PALETTES["dragon-red"];
  return (
    <View style={[{ width: size, height: size, transform: flip ? [{ scaleX: -1 }] : undefined }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id={`body-${spriteKey}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.light} />
            <Stop offset="1" stopColor={palette.dark} />
          </LinearGradient>
          <LinearGradient id={`belly-${spriteKey}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.belly} />
            <Stop offset="1" stopColor={palette.bellyDark} />
          </LinearGradient>
        </Defs>
        <DragonShape palette={palette} fillBody={`url(#body-${spriteKey})`} fillBelly={`url(#belly-${spriteKey})`} />
      </Svg>
    </View>
  );
}

function DragonShape({ palette, fillBody, fillBelly }: { palette: Palette; fillBody: string; fillBelly: string }) {
  return (
    <>
      <Path
        d="M14 70 Q10 55 18 45 Q22 30 38 28 Q40 18 52 18 Q66 16 74 26 Q82 32 84 44 Q88 50 86 60 Q84 72 76 78 Q70 86 60 84 Q50 90 40 86 Q28 86 22 78 Q16 76 14 70 Z"
        fill={fillBody}
        stroke={palette.outline}
        strokeWidth="1.5"
      />
      <Path
        d="M22 72 Q18 62 24 54 Q30 56 32 64 Q34 74 28 78 Q22 78 22 72 Z"
        fill={fillBelly}
        opacity="0.85"
      />
      <Polygon
        points="40,28 44,12 50,26"
        fill={palette.spike}
        stroke={palette.outline}
        strokeWidth="1"
      />
      <Polygon
        points="56,22 62,8 66,22"
        fill={palette.spike}
        stroke={palette.outline}
        strokeWidth="1"
      />
      <Polygon
        points="68,28 74,16 76,30"
        fill={palette.spike}
        stroke={palette.outline}
        strokeWidth="1"
      />
      <Path
        d="M70 38 Q86 30 92 42 Q86 50 78 46 Q72 44 70 38 Z"
        fill={palette.wing}
        stroke={palette.outline}
        strokeWidth="1.5"
      />
      <Path
        d="M76 46 Q88 44 90 54 Q82 58 76 52 Z"
        fill={palette.wingDark}
        opacity="0.7"
      />
      <Circle cx="58" cy="36" r="4" fill="#fff" />
      <Circle cx="58" cy="36" r="2.5" fill="#1a0a0a" />
      <Circle cx="58.5" cy="35.5" r="1" fill="#fff" />
      <Polygon points="46,42 42,48 50,48" fill={palette.outline} />
      <Path d="M22 80 Q12 84 8 78 Q14 76 22 78" fill={palette.dark} stroke={palette.outline} strokeWidth="1" />
    </>
  );
}

type Palette = {
  light: string;
  dark: string;
  belly: string;
  bellyDark: string;
  spike: string;
  wing: string;
  wingDark: string;
  outline: string;
};

const PALETTES: Record<string, Palette> = {
  "dragon-red": {
    light: "#e85040", dark: "#9a1818", belly: "#fbcb88", bellyDark: "#d68a3a",
    spike: "#d8d0c0", wing: "#c43028", wingDark: "#7a1010", outline: "#3a0a0a",
  },
  "dragon-blue": {
    light: "#4080c8", dark: "#1a3a78", belly: "#a8d8e8", bellyDark: "#5090b0",
    spike: "#e8e8f0", wing: "#3060a0", wingDark: "#102060", outline: "#0a1838",
  },
  "dragon-purple": {
    light: "#9050b0", dark: "#3a1858", belly: "#d8b0e0", bellyDark: "#8048a0",
    spike: "#f0e0f0", wing: "#7038a0", wingDark: "#3a1058", outline: "#1a0828",
  },
  "dragon-green": {
    light: "#60a040", dark: "#1c5018", belly: "#d0e090", bellyDark: "#788838",
    spike: "#e8e0c0", wing: "#3a8030", wingDark: "#184018", outline: "#0a2008",
  },
  wolf: {
    light: "#a89878", dark: "#4a3828", belly: "#e8d8b8", bellyDark: "#988868",
    spike: "#e8e0c8", wing: "#806848", wingDark: "#382818", outline: "#1a1008",
  },
  cat: {
    light: "#e0a868", dark: "#7a4828", belly: "#f8e8c8", bellyDark: "#c89858",
    spike: "#fff0d0", wing: "#a87838", wingDark: "#583818", outline: "#2a1808",
  },
  boar: {
    light: "#7a5840", dark: "#382818", belly: "#a08868", bellyDark: "#503828",
    spike: "#e8d8b8", wing: "#503828", wingDark: "#1a1008", outline: "#0a0808",
  },
  fox: {
    light: "#e88040", dark: "#a04018", belly: "#fff0d8", bellyDark: "#c89058",
    spike: "#ffe0c0", wing: "#c05030", wingDark: "#702010", outline: "#3a1008",
  },
  golem: {
    light: "#988878", dark: "#383028", belly: "#c8b8a0", bellyDark: "#786858",
    spike: "#a89888", wing: "#685848", wingDark: "#282018", outline: "#181008",
  },
  bird: {
    light: "#d0d0e0", dark: "#605880", belly: "#f0f0f8", bellyDark: "#9890b0",
    spike: "#ffd848", wing: "#9088a0", wingDark: "#403858", outline: "#1a1828",
  },
};
