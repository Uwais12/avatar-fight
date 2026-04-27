import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, useWindowDimensions, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import * as ScreenOrientation from "expo-screen-orientation";

import { ParchmentBg } from "../components/ParchmentBg";
import { useGame } from "../lib/store";
import { CHARACTER_ASSETS } from "../lib/assets";
import type { CharClass } from "../lib/types";

const CLASSES: { id: CharClass; label: string; bonus: string }[] = [
  { id: "knight", label: "Knight", bonus: "+HP +STR" },
  { id: "ninja", label: "Ninja", bonus: "+SPD +AGL" },
  { id: "mage", label: "Mage", bonus: "+STR +Crit" },
  { id: "archer", label: "Archer", bonus: "+AGL +SPD" },
  { id: "vampire", label: "Vampire", bonus: "+STR +Lifesteal" },
];

export default function Welcome() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const onboard = useGame((s) => s.onboard);
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<CharClass>("knight");

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
  }, []);

  const handleStart = () => {
    if (!name.trim()) {
      Alert.alert("Pick a name", "Enter a hero name to begin.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onboard(name, picked);
    router.replace("/");
  };

  const cardW = Math.min(120, (width - 80) / 5);

  return (
    <ParchmentBg style={styles.root}>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>AVATAR FIGHT</Text>
        <Text style={styles.subtitle}>Create your hero</Text>
      </View>

      <View style={styles.middle}>
        <View style={styles.previewBox}>
          <Image
            source={CHARACTER_ASSETS[picked]}
            style={{ width: 160, height: 160 }}
            contentFit="contain"
          />
          <Text style={styles.previewLabel}>{CLASSES.find((c) => c.id === picked)?.label}</Text>
          <Text style={styles.previewBonus}>{CLASSES.find((c) => c.id === picked)?.bonus}</Text>
        </View>

        <View style={styles.right}>
          <Text style={styles.fieldLabel}>HERO NAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.nameInput}
            placeholder="Enter name..."
            placeholderTextColor="#a08858"
            maxLength={16}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>CHOOSE CLASS</Text>
          <View style={styles.classRow}>
            {CLASSES.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => {
                  setPicked(c.id);
                  Haptics.selectionAsync().catch(() => {});
                }}
                style={[styles.classCard, { width: cardW }, picked === c.id && styles.classCardActive]}
              >
                <Image source={CHARACTER_ASSETS[c.id]} style={{ width: 50, height: 50 }} contentFit="contain" />
                <Text style={styles.className}>{c.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.startBtn} onPress={handleStart}>
            <Text style={styles.startLabel}>START ADVENTURE</Text>
          </Pressable>
        </View>
      </View>
    </ParchmentBg>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  titleWrap: {
    paddingTop: 14,
    paddingBottom: 4,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#7a1f1f",
    letterSpacing: 4,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "#7a4a25",
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  middle: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 14,
    alignItems: "stretch",
  },
  previewBox: {
    width: 200,
    backgroundColor: "rgba(246, 232, 190, 0.7)",
    borderWidth: 2.5,
    borderColor: "#7a4a25",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  previewLabel: {
    fontSize: 18,
    fontWeight: "900",
    color: "#3a2812",
  },
  previewBonus: {
    fontSize: 11,
    color: "#7a1f1f",
    fontWeight: "800",
  },
  right: {
    flex: 1,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#7a1f1f",
    letterSpacing: 1.2,
  },
  nameInput: {
    backgroundColor: "#fff8d8",
    borderWidth: 2,
    borderColor: "#7a4a25",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: "800",
    color: "#3a2812",
  },
  classRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  classCard: {
    backgroundColor: "#f6e8be",
    borderWidth: 2,
    borderColor: "#7a4a25",
    borderRadius: 6,
    padding: 6,
    alignItems: "center",
    gap: 2,
  },
  classCardActive: {
    backgroundColor: "#fff0c8",
    borderColor: "#a82820",
    borderWidth: 3,
  },
  className: {
    fontSize: 11,
    fontWeight: "900",
    color: "#3a2812",
  },
  startBtn: {
    backgroundColor: "#c44030",
    borderWidth: 3,
    borderColor: "#5a0e08",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "rgba(0,0,0,0.4)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  startLabel: {
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 2,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
