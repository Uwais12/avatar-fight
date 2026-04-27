import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { useGame } from "../lib/store";
import { theme } from "../lib/theme";
import { Avatar } from "../components/Avatar";
import { PetSprite } from "../components/PetSprite";
import { StatRow } from "../components/StatRow";
import { WoodButton } from "../components/WoodButton";
import { Parchment } from "../components/Parchment";
import { simulateBattle, totalStats } from "../lib/game";
import type { Player } from "../lib/types";

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const player = useGame((s) => s.player);
  const opponents = useGame((s) => s.opponents);
  const selectedId = useGame((s) => s.selectedOpponentId);
  const refreshOpponents = useGame((s) => s.refreshOpponents);
  const selectOpponent = useGame((s) => s.selectOpponent);
  const setLastBattle = useGame((s) => s.setLastBattle);
  const updatePlayer = useGame((s) => s.updatePlayer);

  const selected = useMemo(
    () => opponents.find((o) => o.id === selectedId) ?? null,
    [opponents, selectedId]
  );

  const handleFight = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const result = simulateBattle(player, selected);
    setLastBattle({
      winner: result.winner,
      events: result.events,
      opponentName: selected.name,
      opponentLevel: selected.level,
    });
    router.push("/battle");
  };

  const handleFightAll = () => {
    if (opponents.length === 0) return;
    let p = player;
    let wins = 0;
    let losses = 0;
    for (const opp of opponents) {
      const r = simulateBattle(p, opp);
      if (r.winner === "p1") {
        wins++;
        const xpGain = 20 + opp.level * 8;
        const goldGain = 50 + opp.level * 12;
        let xp = p.xp + xpGain;
        let level = p.level;
        // simple inline level-up
        const xpFor = (l: number) => Math.round(50 * Math.pow(l, 1.6));
        while (xp >= xpFor(level)) {
          xp -= xpFor(level);
          level++;
        }
        p = { ...p, xp, level, gold: p.gold + goldGain, wins: p.wins + 1, crystals: p.crystals + (Math.random() < 0.25 ? 1 : 0) };
      } else {
        losses++;
        const goldLoss = Math.min(p.gold, 10 + p.level * 2);
        p = { ...p, gold: p.gold - goldLoss, losses: p.losses + 1 };
      }
    }
    updatePlayer(() => p);
    refreshOpponents();
    Alert.alert("Sweep complete", `Won ${wins} • Lost ${losses}`);
  };

  const handleConquer = () => {
    if (!selected) return;
    const goldStolen = Math.floor(player.level * 25 + Math.random() * 50);
    updatePlayer((p) => ({ ...p, gold: p.gold + goldStolen, crystals: p.crystals + 2 }));
    Alert.alert("Conquered!", `Claimed ${goldStolen} gold and 2 crystals from ${selected.name}`);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <WoodButton small label="MENU" onPress={() => router.push("/me")} style={{ flexShrink: 0 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.opponentScroll}>
          {opponents.map((o) => (
            <OpponentTile
              key={o.id}
              opponent={o}
              selected={o.id === selectedId}
              onPress={() => {
                selectOpponent(o.id);
                Haptics.selectionAsync().catch(() => {});
              }}
            />
          ))}
        </ScrollView>
        <View style={{ gap: 4 }}>
          <WoodButton small label="↻" onPress={() => { refreshOpponents(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); }} style={{ minWidth: 40 }} />
          <WoodButton small label="⚙" onPress={() => router.push("/me")} style={{ minWidth: 40 }} />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.leftCol}>
          <WoodButton label="FIGHT" variant="primary" onPress={handleFight} />
          <WoodButton label="CONQUER" variant="primary" onPress={handleConquer} />
          <WoodButton label="FIGHT ALL" variant="primary" onPress={handleFightAll} />
        </View>

        <View style={styles.centerCol}>
          {selected ? <OpponentDetail opponent={selected} /> : <Text style={styles.placeholder}>Pick an opponent</Text>}
        </View>
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.bottomGroup}>
          <Text style={styles.coin}>💰 {player.gold}</Text>
          <Text style={styles.coin}>💎 {player.crystals}</Text>
        </View>
        <View style={styles.bottomGroup}>
          <WoodButton small label="EQUIP" onPress={() => router.push("/equipment")} />
          <WoodButton small label="FORGE" onPress={() => router.push("/shop")} />
          <WoodButton small label="PETS" onPress={() => router.push("/pets")} />
        </View>
      </View>
    </View>
  );
}

function OpponentTile({ opponent, selected, onPress }: { opponent: Player; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tile, selected && styles.tileSelected]}>
      <View style={styles.tileLevel}>
        <Text style={styles.tileLevelText}>Lv{opponent.level}</Text>
      </View>
      <Avatar seed={opponent.avatarSeed} style={opponent.avatarStyle} size={50} framed={false} />
    </Pressable>
  );
}

function OpponentDetail({ opponent }: { opponent: Player }) {
  const stats = totalStats(opponent);
  const winRate = opponent.wins + opponent.losses > 0
    ? Math.round((opponent.wins / (opponent.wins + opponent.losses)) * 100)
    : 0;
  return (
    <Parchment style={{ flex: 1 }}>
      <View style={styles.detailInner}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailName}>👤 {opponent.name}</Text>
          {opponent.guild && <Text style={styles.detailGuild}>🏰 {opponent.guild}</Text>}
        </View>
        <View style={styles.detailStats}>
          <StatRow icon="⚔️" label="STR" value={stats.str} />
          <StatRow icon="🛡️" label="AGL" value={stats.agl} />
          <StatRow icon="👟" label="SPD" value={stats.spd} />
          <StatRow icon="❤️" label="HP" value={stats.hp} />
          <StatRow icon="🏆" label="WIN" value={`${winRate}%`} />
        </View>
        <View style={styles.detailFighters}>
          {opponent.pet && <PetSprite spriteKey={opponent.pet.spriteKey} size={88} />}
          <Avatar seed={opponent.avatarSeed} style={opponent.avatarStyle} size={96} />
        </View>
      </View>
    </Parchment>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.parchment,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: theme.parchmentDark,
    borderBottomWidth: 2,
    borderBottomColor: theme.woodDark,
  },
  opponentScroll: {
    gap: 6,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  tile: {
    width: 58,
    height: 70,
    borderRadius: 6,
    backgroundColor: theme.parchmentLight,
    borderWidth: 2,
    borderColor: theme.woodDark,
    overflow: "hidden",
    alignItems: "center",
  },
  tileSelected: {
    borderColor: theme.banner,
    borderWidth: 3,
  },
  tileLevel: {
    backgroundColor: theme.bannerDark,
    paddingHorizontal: 4,
    paddingVertical: 1,
    width: "100%",
    alignItems: "center",
  },
  tileLevelText: {
    color: "#fff8d8",
    fontWeight: "900",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  body: {
    flex: 1,
    flexDirection: "row",
    padding: 10,
    gap: 10,
  },
  leftCol: {
    width: 110,
    gap: 10,
    paddingTop: 8,
  },
  centerCol: {
    flex: 1,
  },
  detailInner: {
    flex: 1,
    padding: 10,
  },
  detailHeader: {
    marginBottom: 8,
  },
  detailName: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.ink,
  },
  detailGuild: {
    fontSize: 12,
    color: theme.inkLight,
    marginTop: 2,
  },
  detailStats: {
    marginTop: 4,
  },
  detailFighters: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginTop: 8,
    gap: 4,
  },
  placeholder: {
    color: theme.inkLight,
    textAlign: "center",
    marginTop: 40,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
    paddingBottom: 18,
    backgroundColor: theme.parchmentDark,
    borderTopWidth: 2,
    borderTopColor: theme.woodDark,
  },
  bottomGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  coin: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.ink,
  },
});
