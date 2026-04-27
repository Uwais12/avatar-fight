import React from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import * as Haptics from "expo-haptics";

import { useGame } from "../lib/store";
import { theme } from "../lib/theme";
import { Parchment } from "../components/Parchment";
import { WoodButton } from "../components/WoodButton";
import { PetSprite } from "../components/PetSprite";
import { PET_LIBRARY } from "../lib/data";
import { StatRow } from "../components/StatRow";

const PET_COSTS: Record<string, { gold: number; crystals: number }> = {
  "battle-cat": { gold: 300, crystals: 0 },
  "spirit-fox": { gold: 600, crystals: 0 },
  "war-wolf": { gold: 1200, crystals: 1 },
  "iron-boar": { gold: 1800, crystals: 1 },
  "thunder-bird": { gold: 2500, crystals: 2 },
  "moss-serpent": { gold: 3200, crystals: 3 },
  "ember-wyrm": { gold: 4500, crystals: 4 },
  "frost-drake": { gold: 4500, crystals: 4 },
  "shadow-wyvern": { gold: 5500, crystals: 5 },
  "stone-golem": { gold: 6500, crystals: 6 },
};

export default function Pets() {
  const player = useGame((s) => s.player);
  const updatePlayer = useGame((s) => s.updatePlayer);

  const buy = (id: string) => {
    const tpl = PET_LIBRARY.find((p) => p.id === id);
    if (!tpl) return;
    const cost = PET_COSTS[id] ?? { gold: 1000, crystals: 0 };
    if (player.gold < cost.gold || player.crystals < cost.crystals) {
      Alert.alert("Not enough", `Need ${cost.gold} 💰${cost.crystals ? ` + ${cost.crystals} 💎` : ""}`);
      return;
    }
    const newPet = { ...tpl, level: Math.max(1, player.level) };
    updatePlayer((p) => ({
      ...p,
      gold: p.gold - cost.gold,
      crystals: p.crystals - cost.crystals,
      pets: [...(p.pets ?? []), newPet],
      pet: newPet,
    }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.coinRow}>
        <Text style={styles.coin}>💰 {player.gold}</Text>
        <Text style={styles.coin}>💎 {player.crystals}</Text>
      </View>

      <Parchment style={{ marginBottom: 12 }}>
        <View style={styles.activeRow}>
          <View>
            <Text style={styles.section}>ACTIVE</Text>
            {player.pet ? (
              <Text style={styles.activeName}>{player.pet.name} (Lv {player.pet.level})</Text>
            ) : (
              <Text style={styles.activeName}>None</Text>
            )}
          </View>
          {player.pet ? <PetSprite spriteKey={player.pet.spriteKey} size={80} /> : null}
        </View>
      </Parchment>

      {PET_LIBRARY.map((pet) => {
        const owned = player.pet?.id === pet.id;
        const cost = PET_COSTS[pet.id];
        return (
          <Parchment key={pet.id} style={{ marginBottom: 8 }}>
            <View style={styles.row}>
              <PetSprite spriteKey={pet.spriteKey} size={68} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petStats}>
                  ⚔️ {pet.bonusStats.str}  🛡️ {pet.bonusStats.agl}  👟 {pet.bonusStats.spd}  ❤️ {pet.bonusStats.hp}
                </Text>
                <Text style={styles.cost}>{cost.gold} 💰{cost.crystals ? ` + ${cost.crystals} 💎` : ""}</Text>
              </View>
              <WoodButton
                small
                label={owned ? "ACTIVE" : "ADOPT"}
                onPress={() => buy(pet.id)}
                disabled={owned}
              />
            </View>
          </Parchment>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    backgroundColor: theme.parchment,
    paddingBottom: 40,
  },
  coinRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    marginBottom: 12,
  },
  coin: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.ink,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  section: {
    fontSize: 11,
    fontWeight: "800",
    color: theme.inkLight,
    letterSpacing: 1,
  },
  activeName: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.ink,
    marginTop: 2,
  },
  petName: {
    fontSize: 15,
    fontWeight: "900",
    color: theme.ink,
  },
  petStats: {
    fontSize: 12,
    color: theme.inkLight,
    marginTop: 2,
    fontWeight: "700",
  },
  cost: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.bannerDark,
    marginTop: 4,
  },
});
