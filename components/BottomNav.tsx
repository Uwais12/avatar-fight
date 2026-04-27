import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import * as Haptics from "expo-haptics";

const TABS: { id: string; label: string; icon: string; route: string }[] = [
  { id: "home", label: "HERO", icon: "👤", route: "/" },
  { id: "arena", label: "ARENA", icon: "⚔️", route: "/arena" },
  { id: "shop", label: "SHOP", icon: "🛒", route: "/shop" },
  { id: "bag", label: "BAG", icon: "🎒", route: "/bag" },
  { id: "guild", label: "GUILD", icon: "🏰", route: "/guild" },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <View style={styles.nav}>
      {TABS.map((tab) => {
        const active = pathname === tab.route || (tab.route === "/" && pathname === "/index");
        return (
          <Pressable
            key={tab.id}
            onPress={() => {
              if (active) return;
              Haptics.selectionAsync().catch(() => {});
              router.replace(tab.route as never);
            }}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={styles.icon}>{tab.icon}</Text>
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    height: 38,
    flexDirection: "row",
    backgroundColor: "#dec38a",
    borderTopWidth: 2,
    borderTopColor: "#7a4a25",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(122, 74, 37, 0.3)",
  },
  tabActive: {
    backgroundColor: "#c44030",
  },
  icon: {
    fontSize: 14,
  },
  label: {
    color: "#3a2812",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  labelActive: {
    color: "#fff8d8",
  },
});
