import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGame } from "../lib/store";
import { theme } from "../lib/theme";
import { ParchmentBg } from "../components/ParchmentBg";
import { TopResourceBar } from "../components/TopResourceBar";
import { BottomNav } from "../components/BottomNav";
import { CharacterShowcase } from "../components/CharacterShowcase";
import { StatBadge } from "../components/StatBadge";
import { EquipmentSlot } from "../components/EquipmentSlot";
import { Image } from "expo-image";
import { totalStats, powerOf, SLOTS } from "../lib/game";
import { CHARACTER_IDS, CHARACTER_ASSETS, characterIdFromSeed, petAssetFor } from "../lib/assets";

export default function Me() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const player = useGame((s) => s.player);
  const setName = useGame((s) => s.setName);
  const setAvatar = useGame((s) => s.setAvatar);
  const reset = useGame((s) => s.reset);

  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(player.name);
  const [seedDraft, setSeedDraft] = useState(player.avatarSeed);

  const stats = totalStats(player);
  const power = powerOf(player);
  const winRate = player.wins + player.losses > 0
    ? Math.round((player.wins / (player.wins + player.losses)) * 100) : 0;

  const save = () => {
    setName(nameDraft.trim() || "Hero");
    setAvatar(seedDraft.trim() || `hero-${Date.now()}`, player.avatarStyle);
    setEditing(false);
  };

  return (
    <ParchmentBg style={[styles.root, { paddingTop: insets.top }]}>
      <TopResourceBar player={player} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.lvBadge}>
              <Text style={styles.lvText}>Lv {player.level}</Text>
            </View>
            <View style={{ flex: 1 }}>
              {editing ? (
                <TextInput
                  value={nameDraft}
                  onChangeText={setNameDraft}
                  style={styles.nameInput}
                  maxLength={20}
                />
              ) : (
                <Text style={styles.name}>{player.name}</Text>
              )}
              <Text style={styles.guild}>{player.guild ?? "No guild"}</Text>
            </View>
          </View>
          <Pressable
            style={styles.editBtn}
            onPress={() => editing ? save() : setEditing(true)}
          >
            <Text style={styles.editLabel}>{editing ? "SAVE" : "EDIT"}</Text>
          </Pressable>
        </View>

        <CharacterShowcase
          player={player}
          height={260}
          power={power}
          scene="parchment"
          characterScale={0.85}
          petScale={0.62}
          showName={false}
        />

        {editing && (
          <View style={styles.editPanel}>
            <Text style={styles.editTitle}>CHARACTER</Text>
            <View style={styles.charRow}>
              {CHARACTER_IDS.map((cid) => {
                const isCurrent = characterIdFromSeed(seedDraft) === cid;
                return (
                  <Pressable
                    key={cid}
                    onPress={() => setSeedDraft(`${cid}-${Math.random().toString(36).slice(2, 6)}`)}
                    style={[styles.charPick, isCurrent && styles.charPickActive]}
                  >
                    <Image source={CHARACTER_ASSETS[cid]} style={{ width: 50, height: 50 }} contentFit="contain" />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATS</Text>
          <View style={styles.statRow}>
            <StatBadge label="STR" value={stats.str} width={150} />
            <StatBadge label="AGL" value={stats.agl} width={150} />
          </View>
          <View style={styles.statRow}>
            <StatBadge label="SPD" value={stats.spd} width={150} />
            <StatBadge label="HP" value={stats.hp} width={150} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.recordRow}>
            <RecordCell label="WINS" value={player.wins} />
            <RecordCell label="LOSSES" value={player.losses} />
            <RecordCell label="WIN %" value={`${winRate}%`} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EQUIPMENT</Text>
          <View style={styles.equipGrid}>
            {SLOTS.map((slot) => (
              <View key={slot} style={styles.equipCell}>
                <EquipmentSlot slot={slot} equipment={player.equipment[slot]} size={62} onPress={() => router.push("/equipment")} />
                <Text style={styles.equipLabel}>{slot.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>

        {player.pet && (
          <View style={styles.petPanel}>
            <Text style={styles.sectionTitle}>PET</Text>
            <View style={styles.petRow}>
              {petAssetFor(player.pet.id) && <Image source={petAssetFor(player.pet.id)!} style={{ width: 80, height: 80 }} contentFit="contain" />}
              <View style={{ flex: 1 }}>
                <Text style={styles.petName}>{player.pet.name}</Text>
                <Text style={styles.petStats}>Lv {player.pet.level}</Text>
                <Text style={styles.petStats}>⚔️ {player.pet.bonusStats.str}  🛡️ {player.pet.bonusStats.agl}  👟 {player.pet.bonusStats.spd}  ❤️ {player.pet.bonusStats.hp}</Text>
              </View>
            </View>
          </View>
        )}

        <Pressable
          style={styles.dangerBtn}
          onPress={() => Alert.alert("Reset Progress?", "All progress will be wiped.", [
            { text: "Cancel", style: "cancel" },
            { text: "Reset", style: "destructive", onPress: () => { reset(); router.replace("/"); } },
          ])}
        >
          <Text style={styles.dangerLabel}>RESET PROGRESS</Text>
        </Pressable>
      </ScrollView>
      <BottomNav />
      <View style={{ height: insets.bottom, backgroundColor: theme.parchmentDark }} />
    </ParchmentBg>
  );
}

function RecordCell({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.recordCell}>
      <Text style={styles.recordValue}>{value}</Text>
      <Text style={styles.recordLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 12, gap: 10, paddingBottom: 24 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f6e8be",
    borderWidth: 2,
    borderColor: theme.woodDark,
    borderRadius: 8,
    padding: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  lvBadge: {
    backgroundColor: theme.banner,
    borderWidth: 2,
    borderColor: theme.bannerDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  lvText: {
    color: "#fff8d8",
    fontSize: 13,
    fontWeight: "900",
  },
  name: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.ink,
  },
  nameInput: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.ink,
    borderBottomWidth: 1.5,
    borderBottomColor: theme.woodDark,
    paddingVertical: 2,
  },
  guild: {
    fontSize: 12,
    color: theme.inkLight,
    fontWeight: "700",
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: theme.parchmentLight,
    borderWidth: 2,
    borderColor: theme.woodDark,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editLabel: {
    fontWeight: "900",
    fontSize: 11,
    color: theme.ink,
    letterSpacing: 0.8,
  },
  editPanel: {
    backgroundColor: "#f6e8be",
    borderWidth: 2,
    borderColor: theme.woodDark,
    borderRadius: 8,
    padding: 10,
  },
  editTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: theme.bannerDark,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  charRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  charPick: {
    backgroundColor: theme.parchmentLight,
    borderWidth: 2,
    borderColor: theme.woodDark,
    borderRadius: 6,
    padding: 4,
  },
  charPickActive: {
    borderColor: theme.banner,
    borderWidth: 3,
    backgroundColor: theme.parchmentDark,
  },
  section: {
    backgroundColor: "#f6e8be",
    borderWidth: 2,
    borderColor: theme.woodDark,
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: theme.bannerDark,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  statRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  recordRow: {
    flexDirection: "row",
    gap: 6,
  },
  recordCell: {
    flex: 1,
    backgroundColor: theme.parchmentLight,
    borderWidth: 2,
    borderColor: theme.woodDark,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  recordValue: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.ink,
  },
  recordLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.inkLight,
    letterSpacing: 0.8,
  },
  equipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
  },
  equipCell: {
    alignItems: "center",
    gap: 2,
    width: "31%",
  },
  equipLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.inkLight,
    letterSpacing: 0.5,
  },
  petPanel: {
    backgroundColor: "#f6e8be",
    borderWidth: 2,
    borderColor: theme.woodDark,
    borderRadius: 8,
    padding: 10,
  },
  petRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.ink,
  },
  petStats: {
    fontSize: 12,
    color: theme.inkLight,
    fontWeight: "700",
    marginTop: 2,
  },
  dangerBtn: {
    backgroundColor: theme.banner,
    borderWidth: 2.5,
    borderColor: theme.bannerDark,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 6,
  },
  dangerLabel: {
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1,
  },
});
