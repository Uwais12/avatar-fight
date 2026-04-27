import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Haptics from "expo-haptics";

import { ParchmentBg } from "../components/ParchmentBg";
import { TopResourceBar } from "../components/TopResourceBar";
import { BottomNav } from "../components/BottomNav";
import { useGame } from "../lib/store";
import { WEAPON_ASSETS, ARMOR_ASSETS, PET_ASSETS } from "../lib/assets";
import { PET_CATALOG, shopPetToPet, bonusFor } from "../lib/shop";
import { TIER_NAMES, TIER_COLORS } from "../lib/types";
import type { Equipment, EquipSlot } from "../lib/types";

type Tab = "gear" | "pets" | "equipped";

export default function Bag() {
  const { width, height } = useWindowDimensions();
  const player = useGame((s) => s.player);
  const equipFromInventory = useGame((s) => s.equipFromInventory);
  const unequip = useGame((s) => s.unequip);
  const setPet = useGame((s) => s.setPet);
  const [tab, setTab] = useState<Tab>("gear");

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
  }, []);

  const inventory = player.inventory ?? [];
  const ownedPetIds = player.ownedPetIds ?? [];
  const ownedPets = PET_CATALOG.filter((p) => ownedPetIds.includes(p.id));
  const equippedItems: { slot: EquipSlot; eq: Equipment }[] = [];
  for (const slot of ["weapon", "helmet", "chest", "gloves", "boots", "accessory"] as EquipSlot[]) {
    const eq = player.equipment[slot];
    if (eq) equippedItems.push({ slot, eq });
  }

  const headerH = 38;
  const navH = 38;
  const bodyH = height - headerH - navH;

  return (
    <ParchmentBg style={{ flex: 1 }}>
      <TopResourceBar player={player} title="BAG" />

      <View style={[styles.body, { height: bodyH }]}>
        <View style={styles.tabsCol}>
          {([
            { id: "gear", label: "GEAR", icon: "🗡️", count: inventory.length },
            { id: "pets", label: "PETS", icon: "🐉", count: ownedPets.length },
            { id: "equipped", label: "WORN", icon: "🛡️", count: equippedItems.length },
          ] as { id: Tab; label: string; icon: string; count: number }[]).map((t) => (
            <Pressable
              key={t.id}
              onPress={() => { setTab(t.id); Haptics.selectionAsync().catch(() => {}); }}
              style={[styles.tab, tab === t.id && styles.tabActive]}
            >
              <Text style={styles.tabIcon}>{t.icon}</Text>
              <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>{t.label}</Text>
              <Text style={[styles.tabCount, tab === t.id && styles.tabCountActive]}>{t.count}</Text>
            </Pressable>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
          {tab === "gear" && (
            inventory.length === 0 ? (
              <Text style={styles.empty}>No items in bag. Visit the SHOP to buy gear.</Text>
            ) : (
              inventory.map((eq, i) => (
                <ItemCard
                  key={`${eq.name}-${i}`}
                  eq={eq}
                  onAction={() => {
                    equipFromInventory(i);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                  }}
                  actionLabel="EQUIP"
                />
              ))
            )
          )}

          {tab === "pets" && (
            ownedPets.length === 0 ? (
              <Text style={styles.empty}>No pets owned. Visit the SHOP.</Text>
            ) : (
              ownedPets.map((p) => {
                const isActive = player.pet?.id === p.id;
                return (
                  <PetCard
                    key={p.id}
                    pet={p}
                    active={isActive}
                    onAction={() => {
                      if (isActive) {
                        setPet(null);
                      } else {
                        setPet(shopPetToPet(p));
                      }
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                    }}
                  />
                );
              })
            )
          )}

          {tab === "equipped" && (
            equippedItems.length === 0 ? (
              <Text style={styles.empty}>Nothing equipped yet.</Text>
            ) : (
              equippedItems.map(({ slot, eq }) => (
                <ItemCard
                  key={slot}
                  eq={eq}
                  slotLabel={slot}
                  onAction={() => {
                    unequip(slot);
                    Haptics.selectionAsync().catch(() => {});
                  }}
                  actionLabel="UNEQUIP"
                  actionVariant="secondary"
                />
              ))
            )
          )}
        </ScrollView>
      </View>

      <BottomNav />
    </ParchmentBg>
  );
}

function ItemCard({ eq, onAction, actionLabel, actionVariant, slotLabel }: { eq: Equipment; onAction: () => void; actionLabel: string; actionVariant?: "primary" | "secondary"; slotLabel?: string }) {
  const src = eq.slot === "weapon" ? WEAPON_ASSETS[eq.iconKey] : ARMOR_ASSETS[eq.iconKey];
  const bonus = bonusFor(eq);
  return (
    <View style={[styles.card, { borderColor: TIER_COLORS[eq.tier] }]}>
      <View style={styles.cardIconWrap}>
        {src && <Image source={src} style={{ width: 56, height: 56 }} contentFit="contain" />}
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={styles.cardName} numberOfLines={1}>{eq.name}</Text>
        <Text style={styles.cardSlot}>{(slotLabel ?? eq.slot).toUpperCase()} · {TIER_NAMES[eq.tier]}</Text>
        <Text style={styles.cardBonus} numberOfLines={1}>
          {[
            bonus.hp ? `+${bonus.hp} HP` : null,
            bonus.str ? `+${bonus.str} STR` : null,
            bonus.agl ? `+${bonus.agl} AGL` : null,
            bonus.spd ? `+${bonus.spd} SPD` : null,
          ].filter(Boolean).join("  ")}
        </Text>
      </View>
      <Pressable
        onPress={onAction}
        style={[styles.actionBtn, actionVariant === "secondary" && styles.actionBtnSecondary]}
      >
        <Text style={[styles.actionLabel, actionVariant === "secondary" && styles.actionLabelSecondary]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

function PetCard({ pet, active, onAction }: { pet: typeof PET_CATALOG[number]; active: boolean; onAction: () => void }) {
  const src = PET_ASSETS[pet.spriteKey];
  return (
    <View style={[styles.card, { borderColor: active ? "#3a8c3a" : "#7a4a25" }]}>
      <View style={styles.cardIconWrap}>
        {src && <Image source={src} style={{ width: 60, height: 60 }} contentFit="contain" />}
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={styles.cardName} numberOfLines={1}>{pet.name}</Text>
        <Text style={styles.cardSlot}>PET</Text>
        <Text style={styles.cardBonus} numberOfLines={1}>
          {[
            pet.bonus.hp ? `+${pet.bonus.hp} HP` : null,
            pet.bonus.str ? `+${pet.bonus.str} STR` : null,
            pet.bonus.agl ? `+${pet.bonus.agl} AGL` : null,
            pet.bonus.spd ? `+${pet.bonus.spd} SPD` : null,
          ].filter(Boolean).join("  ")}
        </Text>
      </View>
      <Pressable
        onPress={onAction}
        style={[styles.actionBtn, active && styles.actionBtnSecondary]}
      >
        <Text style={[styles.actionLabel, active && styles.actionLabelSecondary]}>{active ? "DROP" : "SUMMON"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flexDirection: "row", padding: 6, gap: 6 },
  tabsCol: { width: 90, gap: 4 },
  tab: {
    backgroundColor: "#f0dba0",
    borderColor: "#7a4a25",
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
    gap: 1,
  },
  tabActive: { backgroundColor: "#c44030", borderColor: "#5a0e08" },
  tabIcon: { fontSize: 16 },
  tabLabel: { color: "#3a2812", fontWeight: "900", fontSize: 10, letterSpacing: 0.5 },
  tabLabelActive: { color: "#fff8d8" },
  tabCount: { color: "#7a4a25", fontSize: 9, fontWeight: "800" },
  tabCountActive: { color: "rgba(255, 248, 216, 0.85)" },
  grid: {
    flex: 1,
    gap: 4,
    paddingHorizontal: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6e8be",
    borderWidth: 2.5,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 8,
  },
  cardIconWrap: {
    width: 60, height: 60,
    backgroundColor: "rgba(255, 240, 200, 0.7)",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: { color: "#3a2812", fontWeight: "900", fontSize: 13 },
  cardSlot: { color: "#7a4a25", fontWeight: "700", fontSize: 10, letterSpacing: 0.5 },
  cardBonus: { color: "#3a2812", fontWeight: "800", fontSize: 10, marginTop: 1 },
  actionBtn: {
    backgroundColor: "#c44030",
    borderColor: "#5a0e08",
    borderWidth: 2,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionBtnSecondary: {
    backgroundColor: "#f0dba0",
    borderColor: "#7a4a25",
  },
  actionLabel: { color: "#fff8d8", fontWeight: "900", fontSize: 11, letterSpacing: 0.5 },
  actionLabelSecondary: { color: "#3a2812" },
  empty: {
    color: "#7a4a25",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 40,
  },
});
