import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Haptics from "expo-haptics";

import { ParchmentBg } from "../components/ParchmentBg";
import { TopResourceBar } from "../components/TopResourceBar";
import { BottomNav } from "../components/BottomNav";
import { useGame } from "../lib/store";
import { WEAPON_CATALOG, ARMOR_CATALOG, PET_CATALOG, shopWeaponToEquipment, shopArmorToEquipment } from "../lib/shop";
import { WEAPON_ASSETS, ARMOR_ASSETS, PET_ASSETS } from "../lib/assets";
import type { ShopArmor, ShopWeapon, ShopPet } from "../lib/shop";

type Tab = "weapons" | "armor" | "pets";

export default function Shop() {
  const { width, height } = useWindowDimensions();
  const player = useGame((s) => s.player);
  const buyEquipment = useGame((s) => s.buyEquipment);
  const buyPet = useGame((s) => s.buyPet);

  const [tab, setTab] = useState<Tab>("weapons");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
  }, []);

  const items = useMemo(() => {
    if (tab === "weapons") return WEAPON_CATALOG.map((w) => ({ ...w, _kind: "weapon" as const }));
    if (tab === "armor") return ARMOR_CATALOG.map((a) => ({ ...a, _kind: "armor" as const }));
    return PET_CATALOG.map((p) => ({ ...p, _kind: "pet" as const }));
  }, [tab]);

  const selected = items.find((i: any) => i.id === selectedId) ?? items[0];

  const inventoryNames = new Set((player.inventory ?? []).map((e) => e.name));
  const equippedNames = new Set(
    Object.values(player.equipment).filter((e): e is import("../lib/types").Equipment => !!e).map((e) => e.name)
  );

  const isOwned = (item: any): boolean => {
    if (item._kind === "pet") return (player.ownedPetIds ?? []).includes(item.id);
    return inventoryNames.has(item.name) || equippedNames.has(item.name);
  };

  const handleBuy = () => {
    if (!selected) return;
    if (isOwned(selected)) {
      Alert.alert("Already owned", "Check your bag to equip it.");
      return;
    }
    if (player.gold < selected.price) {
      Alert.alert("Not enough gold", `Need 🪙 ${selected.price}.`);
      return;
    }
    let ok = false;
    if (selected._kind === "weapon") {
      ok = buyEquipment(shopWeaponToEquipment(selected as ShopWeapon), selected.price);
    } else if (selected._kind === "armor") {
      ok = buyEquipment(shopArmorToEquipment(selected as ShopArmor), selected.price);
    } else {
      ok = buyPet(selected.id, selected.price);
    }
    if (ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  const headerH = 38;
  const navH = 38;
  const bodyH = height - headerH - navH;

  return (
    <ParchmentBg style={{ flex: 1 }}>
      <TopResourceBar player={player} title="SHOP" />

      <View style={[styles.body, { height: bodyH }]}>
        <View style={[styles.tabsCol, { width: Math.min(80, width * 0.11) }]}>
          {(["weapons", "armor", "pets"] as Tab[]).map((t) => (
            <Pressable
              key={t}
              onPress={() => { setTab(t); setSelectedId(null); Haptics.selectionAsync().catch(() => {}); }}
              style={[styles.tab, tab === t && styles.tabActive]}
            >
              <Text style={styles.tabIcon}>{t === "weapons" ? "⚔️" : t === "armor" ? "🛡️" : "🐉"}</Text>
              <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>{t.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {items.map((item: any) => {
            const owned = isOwned(item);
            const canAfford = player.gold >= item.price;
            const isSelected = selectedId === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setSelectedId(item.id)}
                style={[styles.row, isSelected && styles.rowSelected]}
              >
                <View style={styles.rowIcon}>
                  <ItemIcon item={item} kind={item._kind} size={36} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.rowStats} numberOfLines={1}>
                    {bonusLabel((item as any).bonus)}
                  </Text>
                </View>
                <View style={styles.rowPrice}>
                  {owned ? (
                    <Text style={styles.ownedTag}>OWNED</Text>
                  ) : (
                    <Text style={[styles.priceText, !canAfford && { color: "#7a1f1f" }]}>🪙 {item.price}</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.detail}>
          {selected && (
            <>
              <View style={styles.detailIconWrap}>
                <ItemIcon item={selected} kind={selected._kind} size={90} />
              </View>
              <Text style={styles.detailName}>{selected.name}</Text>
              <Text style={styles.detailKind}>{selected._kind === "weapon" ? "Weapon" : selected._kind === "armor" ? `${(selected as any).slot}` : "Pet"} · T{(selected as any).tier ?? "—"}</Text>
              <View style={styles.bonusBox}>
                {bonusList((selected as any).bonus).map((b) => (
                  <Text key={b.label} style={styles.bonusLine}>+{b.value} {b.label}</Text>
                ))}
              </View>
              <Pressable
                style={[
                  styles.buyBtn,
                  isOwned(selected) ? styles.buyBtnOwned : (player.gold < selected.price ? styles.buyBtnDisabled : null),
                ]}
                disabled={isOwned(selected) || player.gold < selected.price}
                onPress={handleBuy}
              >
                <Text style={styles.buyLabel}>
                  {isOwned(selected) ? "OWNED" : `BUY 🪙 ${selected.price}`}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      <BottomNav />
    </ParchmentBg>
  );
}

function ItemIcon({ item, kind, size }: { item: any; kind: string; size: number }) {
  if (kind === "pet") {
    const src = PET_ASSETS[(item as ShopPet).spriteKey];
    return <Image source={src} style={{ width: size, height: size }} contentFit="contain" />;
  }
  if (kind === "weapon") {
    const src = WEAPON_ASSETS[(item as ShopWeapon).iconKey];
    return <Image source={src} style={{ width: size, height: size }} contentFit="contain" />;
  }
  const src = ARMOR_ASSETS[(item as ShopArmor).iconKey];
  return <Image source={src} style={{ width: size, height: size }} contentFit="contain" />;
}

function bonusList(bonus: any): { label: string; value: number }[] {
  if (!bonus) return [];
  const out: { label: string; value: number }[] = [];
  if (bonus.hp) out.push({ label: "HP", value: bonus.hp });
  if (bonus.str) out.push({ label: "STR", value: bonus.str });
  if (bonus.agl) out.push({ label: "AGL", value: bonus.agl });
  if (bonus.spd) out.push({ label: "SPD", value: bonus.spd });
  return out;
}

function bonusLabel(bonus: any): string {
  if (!bonus) return "";
  return bonusList(bonus).map((b) => `+${b.value} ${b.label}`).join("  ");
}

const styles = StyleSheet.create({
  body: { flexDirection: "row", padding: 6, gap: 6 },
  tabsCol: { gap: 4 },
  tab: {
    backgroundColor: "#f0dba0",
    borderColor: "#7a4a25",
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    gap: 2,
  },
  tabActive: { backgroundColor: "#c44030", borderColor: "#5a0e08" },
  tabIcon: { fontSize: 18 },
  tabLabel: { color: "#3a2812", fontWeight: "900", fontSize: 11, letterSpacing: 0.5 },
  tabLabelActive: { color: "#fff8d8" },
  list: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6e8be",
    borderColor: "#7a4a25",
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 5,
    gap: 8,
  },
  rowSelected: {
    backgroundColor: "#fff0c8",
    borderColor: "#a82820",
    borderWidth: 2.5,
  },
  rowIcon: {
    width: 40, height: 40,
    backgroundColor: "rgba(122, 74, 37, 0.1)",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  rowName: { color: "#3a2812", fontWeight: "900", fontSize: 12 },
  rowStats: { color: "#7a4a25", fontWeight: "700", fontSize: 10, marginTop: 2 },
  rowPrice: { minWidth: 64, alignItems: "flex-end" },
  priceText: { color: "#3a2812", fontWeight: "900", fontSize: 12 },
  ownedTag: { color: "#3a8c3a", fontWeight: "900", fontSize: 11, letterSpacing: 0.5 },
  detail: {
    width: 160,
    backgroundColor: "rgba(246, 232, 190, 0.85)",
    borderColor: "#7a4a25",
    borderWidth: 2,
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
    gap: 4,
  },
  detailIconWrap: {
    width: 100, height: 100,
    backgroundColor: "#fff0c8",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#7a4a25",
    alignItems: "center",
    justifyContent: "center",
  },
  detailName: { color: "#3a2812", fontWeight: "900", fontSize: 14, textAlign: "center" },
  detailKind: { color: "#7a4a25", fontWeight: "700", fontSize: 10 },
  bonusBox: {
    width: "100%",
    backgroundColor: "rgba(255,248,216,0.9)",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    gap: 1,
  },
  bonusLine: { color: "#3a2812", fontWeight: "800", fontSize: 11 },
  buyBtn: {
    width: "100%",
    backgroundColor: "#c44030",
    borderColor: "#5a0e08",
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  buyBtnDisabled: { opacity: 0.45 },
  buyBtnOwned: { backgroundColor: "#3a8c3a", borderColor: "#1f5a1f" },
  buyLabel: { color: "#fff8d8", fontWeight: "900", fontSize: 12, letterSpacing: 0.5 },
});
