import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { ParchmentBg } from "../components/ParchmentBg";
import { TopResourceBar } from "../components/TopResourceBar";
import { BottomNav } from "../components/BottomNav";
import { useGame } from "../lib/store";
import { GUILDS } from "../lib/data";

export default function Guild() {
  const player = useGame((s) => s.player);
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
  }, []);

  if (!player.guild) {
    return (
      <ParchmentBg style={{ flex: 1 }}>
        <TopResourceBar title="GUILD" />
        <View style={styles.body}>
          <View style={styles.leftPanel}>
            <Text style={styles.heading}>JOIN A GUILD</Text>
            <Text style={styles.body1}>Fight in wars, guild league 5v5, and shared loot.</Text>
            <Pressable style={styles.btnPrimary}>
              <Text style={styles.btnPrimaryText}>FIND GUILD</Text>
            </Pressable>
            <Pressable style={styles.btnSecondary}>
              <Text style={styles.btnSecondaryText}>CREATE GUILD</Text>
            </Pressable>
          </View>
          <View style={styles.rightPanel}>
            <Text style={styles.heading}>RECOMMENDED</Text>
            <ScrollView contentContainerStyle={{ gap: 4 }} showsVerticalScrollIndicator={false}>
              {GUILDS.slice(0, 6).map((g, i) => (
                <View key={g} style={styles.guildRow}>
                  <Text style={styles.guildName}>🏰 {g}</Text>
                  <Text style={styles.guildMeta}>{12 + i * 3}/30 members</Text>
                  <Pressable style={styles.smallBtn}>
                    <Text style={styles.smallBtnText}>JOIN</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
        <BottomNav />
      </ParchmentBg>
    );
  }

  return (
    <ParchmentBg style={{ flex: 1 }}>
      <TopResourceBar title="GUILD" />
      <View style={styles.body}>
        <Text>{player.guild}</Text>
      </View>
      <BottomNav />
    </ParchmentBg>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, flexDirection: "row", padding: 8, gap: 8 },
  leftPanel: {
    flex: 1,
    backgroundColor: "rgba(246, 232, 190, 0.7)",
    borderColor: "#7a4a25",
    borderWidth: 2,
    borderRadius: 6,
    padding: 12,
    gap: 10,
    justifyContent: "center",
  },
  rightPanel: {
    flex: 1,
    backgroundColor: "rgba(246, 232, 190, 0.7)",
    borderColor: "#7a4a25",
    borderWidth: 2,
    borderRadius: 6,
    padding: 8,
  },
  heading: { color: "#3a2812", fontWeight: "900", fontSize: 14, letterSpacing: 1, marginBottom: 6 },
  body1: { color: "#3a2812", fontSize: 12, fontWeight: "700" },
  btnPrimary: {
    backgroundColor: "#c44030",
    borderColor: "#5a0e08",
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
  },
  btnPrimaryText: { color: "#fff8d8", fontWeight: "900", fontSize: 13, letterSpacing: 0.5 },
  btnSecondary: {
    backgroundColor: "#f0dba0",
    borderColor: "#7a4a25",
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
  },
  btnSecondaryText: { color: "#3a2812", fontWeight: "900", fontSize: 13, letterSpacing: 0.5 },
  guildRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6e8be",
    borderColor: "#7a4a25",
    borderWidth: 1.5,
    borderRadius: 4,
    padding: 6,
    gap: 8,
  },
  guildName: { color: "#3a2812", fontWeight: "900", fontSize: 12, flex: 1 },
  guildMeta: { color: "#7a4a25", fontWeight: "700", fontSize: 10 },
  smallBtn: {
    backgroundColor: "#c44030",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  smallBtnText: { color: "#fff8d8", fontWeight: "900", fontSize: 10, letterSpacing: 0.5 },
});
