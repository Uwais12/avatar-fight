import React from "react";
import { View, Text, StyleSheet, ImageSourcePropType } from "react-native";
import { Image } from "expo-image";
import Svg, { Defs, LinearGradient, Stop, Rect, Ellipse, Pattern } from "react-native-svg";
import { characterAssets, petAssets, type CharClass, type PetKind } from "../lib/assets";

type Props = {
  charClass?: CharClass | string | null;
  petKind?: PetKind | string | null;
  name?: string;
  player?: any;
  scene?: string;
  characterScale?: number;
  petScale?: number;
  showName?: boolean;
  showPower?: boolean;
  facing?: "left" | "right";
  style?: any;
  level?: number;
  classLabel?: string;
  power?: number;
  width?: number;
  height?: number;
  flipped?: boolean;
  background?: "parchment" | "bamboo" | "arena" | "dojo" | "ruins";
  showLabel?: boolean;
};

export function CharacterShowcase({
  charClass,
  petKind,
  name,
  level,
  classLabel,
  power,
  width,
  height,
  flipped,
  background = "parchment",
  showLabel = true,
  player,
}: Props) {
  const cls = charClass ?? player?.charClass ?? "knight";
  const petK = petKind ?? player?.pet?.kind ?? player?.pet?.id;
  const charSrc: ImageSourcePropType | undefined =
    cls && characterAssets[cls] ? characterAssets[cls] : characterAssets.knight;
  const petSrc: ImageSourcePropType | undefined =
    petK && petAssets[petK] ? petAssets[petK] : undefined;

  const w = width ?? 300;
  const h = height ?? 220;
  const charSize = Math.min(h * 0.78, w * 0.55);
  const petSize = charSize * 0.72;

  return (
    <View style={[styles.frame, { width: w, height: h }]}>
      <Background variant={background} width={w} height={h} />

      <View style={[styles.scene, { transform: flipped ? [{ scaleX: -1 }] : undefined }]}>
        {petSrc && (
          <Image
            source={petSrc}
            style={{
              width: petSize,
              height: petSize,
              position: "absolute",
              left: w * 0.18 - petSize * 0.4,
              bottom: h * 0.06,
            }}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
        )}
        <Image
          source={charSrc}
          style={{
            width: charSize,
            height: charSize,
            position: "absolute",
            right: w * 0.16 - charSize * 0.25,
            bottom: h * 0.04,
          }}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      </View>

      {showLabel && (name || level !== undefined || power !== undefined) && (
        <View style={styles.labelStrip}>
          {name && (
            <Text style={styles.labelName} numberOfLines={1}>
              {level !== undefined ? `Lv${level}  ` : ""}{name}
              {classLabel ? ` · ${classLabel}` : ""}
            </Text>
          )}
          {power !== undefined && (
            <Text style={styles.labelPower}>PWR {power}</Text>
          )}
        </View>
      )}
    </View>
  );
}

function Background({ variant, width, height }: { variant: Props["background"]; width: number; height: number }) {
  if (variant === "bamboo") {
    return (
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#8aa84a" />
            <Stop offset="0.7" stopColor="#5a7a30" />
            <Stop offset="1" stopColor="#3a4818" />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#bg)" />
        {Array.from({ length: 16 }).map((_, i) => {
          const x = (i * width) / 16 + (i % 2 === 0 ? 4 : 12);
          return <Rect key={i} x={x} y={0} width={5} height={height - 36} fill="#3a4818" opacity={0.55} />;
        })}
        <Rect x={0} y={height - 36} width={width} height={36} fill="#a08858" />
        <Rect x={0} y={height - 36} width={width} height={4} fill="#5a4830" />
      </Svg>
    );
  }
  if (variant === "arena") {
    return (
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="arena" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#a06840" />
            <Stop offset="0.7" stopColor="#7a4828" />
            <Stop offset="1" stopColor="#4a2818" />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#arena)" />
        <Rect x={0} y={height - 30} width={width} height={30} fill="#5a3a20" />
      </Svg>
    );
  }
  if (variant === "dojo") {
    return (
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="dojo" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#dcc488" />
            <Stop offset="1" stopColor="#a08858" />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#dojo)" />
        <Rect x={0} y={height - 28} width={width} height={28} fill="#7a5a30" />
      </Svg>
    );
  }
  if (variant === "ruins") {
    return (
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="ruins" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#6a6878" />
            <Stop offset="1" stopColor="#3a3848" />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#ruins)" />
        <Rect x={0} y={height - 30} width={width} height={30} fill="#2a2838" />
      </Svg>
    );
  }
  // parchment default
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <Pattern id="weave-cs" patternUnits="userSpaceOnUse" width="18" height="18">
          <Rect width="18" height="18" fill="#e7d29c" />
          <Rect x="0" y="0" width="9" height="9" fill="#dcc380" opacity="0.55" />
          <Rect x="9" y="9" width="9" height="9" fill="#dcc380" opacity="0.55" />
        </Pattern>
      </Defs>
      <Rect width={width} height={height} fill="url(#weave-cs)" />
      <Ellipse cx={width / 2} cy={height - 16} rx={width * 0.35} ry={8} fill="rgba(0,0,0,0.18)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: "#7a4a25",
    borderRadius: 10,
    padding: 3,
    overflow: "hidden",
    position: "relative",
  },
  scene: {
    flex: 1,
    position: "relative",
  },
  labelStrip: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(58, 24, 8, 0.78)",
  },
  labelName: {
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 0.4,
    flex: 1,
  },
  labelPower: {
    color: "#ffd848",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
