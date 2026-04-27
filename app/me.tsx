import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";

import { useGame } from "../lib/store";
import { theme } from "../lib/theme";
import { Avatar } from "../components/Avatar";
import { WoodButton } from "../components/WoodButton";
import { Parchment } from "../components/Parchment";
import { StatRow } from "../components/StatRow";
import { totalStats, xpForLevel } from "../lib/game";
import type { AvatarStyle } from "../lib/types";

const STYLES: AvatarStyle[] = ["lorelei", "adventurer", "micah", "personas", "notionists"];

export default function Me() {
  const player = useGame((s) => s.player);
  const setName = useGame((s) => s.setName);
  const setAvatar = useGame((s) => s.setAvatar);
  const reset = useGame((s) => s.reset);
  const router = useRouter();

  const [nameDraft, setNameDraft] = useState(player.name);
  const [seedDraft, setSeedDraft] = useState(player.avatarSeed);
  const [styleDraft, setStyleDraft] = useState<AvatarStyle>(player.avatarStyle);

  const stats = totalStats(player);
  const xpNeeded = xpForLevel(player.level);
  const winRate = player.wins + player.losses > 0
    ? Math.round((player.wins / (player.wins + player.losses)) * 100) : 0;

  const save = () => {
    setName(nameDraft.trim() || "Hero");
    setAvatar(seedDraft.trim() || `hero-${Date.now()}`, styleDraft);
    router.back();
  };

  const randomize = () => {
    setSeedDraft(`hero-${Math.random().toString(36).slice(2, 8)}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.headRow}>
        <Avatar seed={seedDraft} style={styleDraft} size={120} />
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={styles.label}>NAME</Text>
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            style={styles.input}
            maxLength={20}
            placeholder="Hero"
            placeholderTextColor={theme.inkLight}
          />
          <Text style={styles.label}>LEVEL</Text>
          <Text style={styles.lvlText}>Lv {player.level} ({player.xp} / {xpNeeded} XP)</Text>
        </View>
      </View>

      <Parchment>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AVATAR STYLE</Text>
          <View style={styles.styleRow}>
            {STYLES.map((s) => (
              <Pressable
                key={s}
                onPress={() => setStyleDraft(s)}
                style={[styles.stylePick, styleDraft === s && styles.stylePickSelected]}
              >
                <Avatar seed={seedDraft} style={s} size={48} framed={false} />
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>SEED</Text>
              <TextInput
                value={seedDraft}
                onChangeText={setSeedDraft}
                style={styles.input}
                maxLength={30}
              />
            </View>
            <WoodButton small label="RANDOM" onPress={randomize} style={{ marginTop: 14 }} />
          </View>
        </View>
      </Parchment>

      <Parchment style={{ marginTop: 12 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATS</Text>
          <StatRow icon="⚔️" label="STR" value={stats.str} />
          <StatRow icon="🛡️" label="AGL" value={stats.agl} />
          <StatRow icon="👟" label="SPD" value={stats.spd} />
          <StatRow icon="❤️" label="HP" value={stats.hp} />
          <StatRow icon="🏆" label="WIN" value={`${winRate}%  (${player.wins}W / ${player.losses}L)`} />
        </View>
      </Parchment>

      <View style={styles.buttonRow}>
        <WoodButton label="SAVE" onPress={save} />
        <WoodButton label="RESET PROGRESS" variant="danger" onPress={() => {
          Alert.alert("Reset?", "All progress will be wiped. Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Reset", style: "destructive", onPress: () => { reset(); router.replace("/"); } },
          ]);
        }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    gap: 12,
    backgroundColor: theme.parchment,
  },
  headRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    color: theme.inkLight,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: theme.parchmentLight,
    borderWidth: 2,
    borderColor: theme.woodDark,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: "700",
    color: theme.ink,
  },
  lvlText: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.ink,
  },
  section: {
    padding: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
    color: theme.ink,
    marginBottom: 8,
  },
  styleRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  stylePick: {
    padding: 3,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.woodDark,
    backgroundColor: theme.parchmentLight,
  },
  stylePickSelected: {
    borderColor: theme.banner,
    borderWidth: 3,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    marginBottom: 30,
  },
});
