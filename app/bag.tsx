import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions, Alert } from "react-native";
import { Image } from "expo-image";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Haptics from "expo-haptics";

import { ParchmentBg } from "../components/ParchmentBg";
import { TopResourceBar } from "../components/TopResourceBar";
import { BottomNav } from "../components/BottomNav";
import { useGame } from "../lib/store";
import { weaponAssets, armorAssets, petAssets } from "../lib/assets";
import { TIER_NAMES, TIER_COLORS } from "../lib/types";
import { SLOTS } from "../lib/game";
import type { EquipSlot } from "../lib/types";

type Tab = "gear" | "pets" | "materials";

const SLOT_TO_ASSET: Record<EquipSlot, string> = {
  weapon: "sword",
  helmet: "helm",
  chest: "plate",
  gloves: "leather",
  boots: "leather",
  accessory: "chain",
};

export default function Bag() {
  const { height } = useWindowDimensions();
  const player = useGame((s) => s.player);
  const setEquipment = useGame((s) => s.setEquipment);
  const [tab, setTab] = useState<Tab>("gear");
  const [selectedSlot, setSelectedSlot] = useState<EquipSlot | null>("weapon");

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
  }, []);

  const headerH = 38;
  const navH = 38;
  const bodyH = height - headerH - navH;
  const selected = selectedSlot ? player.equipment[selectedSlot] : null;

  return (
    <ParchmentBg style={{ flex: 1 }}>
      <TopResourceBar title="BAG" />
      <View style={[styles.body, { height: bodyH }]}>
        <View style={styles.leftCol}>
          {(["gear", "pets", "materials"] as Tab[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => { setTab(t); Haptics.selectionAsync().catch(() => {}); }}
              style={[styles.tab, tab === t && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, tab === t && { color: "#fff8d8" }]}>{t.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.gridWrap} showsVerticalScrollIndicator={false}>
          {tab === "gear" && (
            <View style={styles.grid}>
              {SLOTS.map((slot) => {
                const eq = player.equipment[slot];
                const tier = eq?.tier ?? 0;
                const assetKey = SLOT_TO_ASSET[slot];
                const src = slot === "weapon" ? weaponAssets[assetKey] : armorAssets[assetKey];
                return (
                  <Pressable
                    key={slot}
                    onPress={() => setSelectedSlot(slot)}
                    style={[styles.itemCard, selectedSlot === slot && styles.itemCardSelected, { borderColor: TIER_COLORS[tier] }]}
                  >
                    {src ? <Image source={src} style={styles.itemIcon} contentFit="contain" /> : null}
                    <Text style={styles.itemTier}>{TIER_NAMES[tier]}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          {tab === "pets" && player.pet && (
            <View style={styles.grid}>
              <View style={styles.itemCard}>
                <Image source={petAssets[player.pet.kind ?? player.pet.id]} style={styles.itemIcon} contentFit="contain" />
                <Text style={styles.itemTier}>{player.pet.name}</Text>
              </View>
            </View>
          )}
          {tab === "materials" && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>💎 {player.crystals}</Text>
              <Text style={styles.emptySub}>Earn crystals by winning battles</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.rightCol}>
          {selectedSlot && selected ? (
            <View>
              <Text style={styles.detailHeader}>{selected.name}</Text>
              <Text style={styles.detailMeta}>{selectedSlot.toUpperCase()} · {TIER_NAMES[selected.tier]}</Text>
              <View style={[styles.detailIcon, { borderColor: TIER_COLORS[selected.tier] }]}>
                {(selectedSlot === "weapon" ? weaponAssets[SLOT_TO_ASSET[selectedSlot]] : armorAssets[SLOT_TO_ASSET[selectedSlot]]) && (
                  <Image
                    source={(selectedSlot === "weapon" ? weaponAssets : armorAssets)[SLOT_TO_ASSET[selectedSlot]]}
                    style={{ width: 110, height: 110 }}
                    contentFit="contain"
                  />
                )}
              </View>
              <Pressable style={styles.detailBtn} onPress={() => Alert.alert("Equipped", `${selected.name} is already equipped`)}>
                <Text style={styles.detailBtnText}>EQUIPPED</Text>
              </Pressable>
            </View>
          ) : selectedSlot ? (
            <View>
              <Text style={styles.detailHeader}>{selectedSlot.toUpperCase()}</Text>
              <Text style={styles.detailMeta}>(empty)</Text>
              <Pressable style={styles.detailBtn} onPress={() => { Haptics.selectionAsync().catch(() => {}); }}>
                <Text style={styles.detailBtnText}>VISIT FORGE</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
      <BottomNav />
    </ParchmentBg>
  );
}

const styles = StyleSheet.create({
  body: { flexDirection: "row", paddingHorizontal: 6, paddingVertical: 4, gap: 6 },
  leftCol: { width: 110, gap: 6 },
  tab: {
    backgroundColor: "#f0dba0",
    borderColor: "#7a4a25",
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#c44030", borderColor: "#5a0e08" },
  tabLabel: { color: "#3a2812", fontWeight: "900", fontSize: 12, letterSpacing: 0.5 },
  gridWrap: { padding: 4, flexGrow: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  itemCard: {
    width: 80,
    height: 100,
    backgroundColor: "#f6e8be",
    borderColor: "#7a4a25",
    borderWidth: 2.5,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  itemCardSelected: { backgroundColor: "#fff0c8", borderColor: "#a82820" },
  itemIcon: { width: 56, height: 56 },
  itemTier: { color: "#3a2812", fontWeight: "800", fontSize: 10, marginTop: 2 },
  rightCol: {
    width: 180,
    backgroundColor: "rgba(246, 232, 190, 0.6)",
    borderColor: "#7a4a25",
    borderWidth: 2,
    borderRadius: 6,
    padding: 8,
    gap: 6,
  },
  detailHeader: { color: "#3a2812", fontWeight: "900", fontSize: 14 },
  detailMeta: { color: "#7a4a25", fontWeight: "700", fontSize: 11, marginBottom: 6 },
  detailIcon: {
    alignSelf: "center",
    backgroundColor: "#fff0c8",
    borderWidth: 2,
    borderRadius: 6,
    padding: 4,
  },
  detailBtn: {
    backgroundColor: "#c44030",
    borderColor: "#5a0e08",
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 8,
  },
  detailBtnText: { color: "#fff8d8", fontWeight: "900", fontSize: 12, letterSpacing: 0.5 },
  empty: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  emptyText: { fontSize: 32, fontWeight: "900", color: "#3a2812" },
  emptySub: { color: "#7a4a25", fontWeight: "700", marginTop: 6 },
});
