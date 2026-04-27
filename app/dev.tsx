// Test fixture route. Hit `exp://.../--/dev?weapon=bow&armor=plate&pets=2`
// to set the player to a known equipped state, then redirect to /.
// Used by scripts/sim-screenshot.sh for headless visual regression testing.

import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text } from "react-native";
import { useGame } from "../lib/store";
import { PET_CATALOG, WEAPON_CATALOG, ARMOR_CATALOG, shopArmorToEquipment, shopPetToPet, shopWeaponToEquipment } from "../lib/shop";
import type { CharClass } from "../lib/types";

export default function DevFixture() {
  const params = useLocalSearchParams<{ class?: string; weapon?: string; armor?: string; pets?: string }>();
  const router = useRouter();
  const updatePlayer = useGame((s) => s.updatePlayer);

  useEffect(() => {
    const cls = (params.class ?? "knight") as CharClass;
    const weaponKey = params.weapon ?? "";
    const armorKey = params.armor ?? "";
    const petCount = Math.max(0, Math.min(3, Number(params.pets ?? "0")));

    const weapon = WEAPON_CATALOG.find((w) => w.iconKey === weaponKey);
    const armor = ARMOR_CATALOG.find((a) => a.iconKey === armorKey);
    const pets = PET_CATALOG.slice(0, petCount).map((p) => shopPetToPet(p));

    updatePlayer((p) => ({
      ...p,
      name: "uwii",
      charClass: cls,
      onboarded: true,
      gold: 5000,
      crystals: 20,
      avatarSeed: `${cls}-test`,
      level: 5,
      equipment: {
        ...p.equipment,
        weapon: weapon ? shopWeaponToEquipment(weapon) : null,
        chest: armor ? shopArmorToEquipment(armor) : null,
      },
      pets,
      pet: pets[0] ?? null,
    }));

    setTimeout(() => router.replace("/"), 80);
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#e7d29c" }}>
      <Text style={{ fontWeight: "900", color: "#2a1810" }}>Loading test fixture…</Text>
    </View>
  );
}
