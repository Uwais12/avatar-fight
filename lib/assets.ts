import type { ImageSourcePropType } from "react-native";

export const CHARACTER_ASSETS: Record<string, ImageSourcePropType> = {
  knight: require("../assets/generated/characters/knight.png"),
  ninja: require("../assets/generated/characters/ninja.png"),
  mage: require("../assets/generated/characters/mage.png"),
  archer: require("../assets/generated/characters/archer.png"),
  vampire: require("../assets/generated/characters/vampire.png"),
};

export const PET_ASSETS: Record<string, ImageSourcePropType> = {
  "ember-wyrm": require("../assets/generated/pets/ember-wyrm.png"),
  "frost-drake": require("../assets/generated/pets/frost-drake.png"),
  "war-wolf": require("../assets/generated/pets/war-wolf.png"),
  "battle-cat": require("../assets/generated/pets/battle-cat.png"),
  "thunder-bird": require("../assets/generated/pets/thunder-bird.png"),
};

export const WEAPON_ASSETS: Record<string, ImageSourcePropType> = {
  sword: require("../assets/generated/weapon-sword.png"),
  bow: require("../assets/generated/weapon-bow.png"),
  staff: require("../assets/generated/weapon-staff.png"),
  axe: require("../assets/generated/weapon-axe.png"),
  mace: require("../assets/generated/weapon-mace.png"),
  dagger: require("../assets/generated/weapon-dagger.png"),
};

export const ARMOR_ASSETS: Record<string, ImageSourcePropType> = {
  leather: require("../assets/generated/armor-leather.png"),
  chain: require("../assets/generated/armor-chain.png"),
  plate: require("../assets/generated/armor-plate.png"),
  robe: require("../assets/generated/armor-robe.png"),
  // legacy slot-named fallbacks
  helm: require("../assets/generated/armor/helm.png"),
  chest: require("../assets/generated/armor-leather.png"),
  boots: require("../assets/generated/armor/boots.png"),
};

export const CHARACTER_IDS = ["knight", "ninja", "mage", "archer", "vampire"] as const;
export type CharacterId = typeof CHARACTER_IDS[number];

export function characterIdFromSeed(seed: string): CharacterId {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return CHARACTER_IDS[h % CHARACTER_IDS.length];
}

const PET_FALLBACK_KEYS = Object.keys(PET_ASSETS);

// Backward-compat lowercase aliases
export const characterAssets = CHARACTER_ASSETS;
export const petAssets = PET_ASSETS;
export const weaponAssets = WEAPON_ASSETS;
export const armorAssets = ARMOR_ASSETS;
export type CharClass = "knight" | "ninja" | "mage" | "archer" | "vampire";
export type PetKind = "ember-wyrm" | "frost-drake" | "war-wolf" | "battle-cat" | "thunder-bird";
export const characterClasses: CharClass[] = ["knight", "ninja", "mage", "archer", "vampire"];
export const petKinds: PetKind[] = ["ember-wyrm", "frost-drake", "war-wolf", "battle-cat", "thunder-bird"];
export const classDefaultWeapon: Record<CharClass, string> = {
  knight: "sword", ninja: "sword", mage: "staff", archer: "bow", vampire: "sword",
};
export const classDefaultArmor: Record<CharClass, string> = {
  knight: "chest", ninja: "chest", mage: "chest", archer: "chest", vampire: "chest",
};

export function petAssetFor(petId: string | undefined | null): ImageSourcePropType | null {
  if (!petId) return null;
  if (PET_ASSETS[petId]) return PET_ASSETS[petId];
  let h = 0;
  for (let i = 0; i < petId.length; i++) h = (h * 31 + petId.charCodeAt(i)) >>> 0;
  return PET_ASSETS[PET_FALLBACK_KEYS[h % PET_FALLBACK_KEYS.length]];
}

// Combo assets — full-body chibi rendered with specific armor + weapon already painted on.
// Naming: <charClass>__<armorIconKey|none>__<weaponIconKey|none>.png
// Armors covered: leather, chain, plate. Weapons covered: sword, bow, staff. Anything else falls back to base char.
const COMBO_ARMORS = new Set(["none", "leather", "chain", "plate"]);
const COMBO_WEAPONS = new Set(["none", "sword", "bow", "staff"]);

export const COMBO_ASSETS: Record<string, ImageSourcePropType> = {
  "archer__chain__bow": require("../assets/generated/combos/archer__chain__bow.png"),
  "archer__chain__none": require("../assets/generated/combos/archer__chain__none.png"),
  "archer__chain__staff": require("../assets/generated/combos/archer__chain__staff.png"),
  "archer__chain__sword": require("../assets/generated/combos/archer__chain__sword.png"),
  "archer__leather__bow": require("../assets/generated/combos/archer__leather__bow.png"),
  "archer__leather__none": require("../assets/generated/combos/archer__leather__none.png"),
  "archer__leather__staff": require("../assets/generated/combos/archer__leather__staff.png"),
  "archer__leather__sword": require("../assets/generated/combos/archer__leather__sword.png"),
  "archer__none__bow": require("../assets/generated/combos/archer__none__bow.png"),
  "archer__none__staff": require("../assets/generated/combos/archer__none__staff.png"),
  "archer__none__sword": require("../assets/generated/combos/archer__none__sword.png"),
  "archer__plate__bow": require("../assets/generated/combos/archer__plate__bow.png"),
  "archer__plate__none": require("../assets/generated/combos/archer__plate__none.png"),
  "archer__plate__staff": require("../assets/generated/combos/archer__plate__staff.png"),
  "archer__plate__sword": require("../assets/generated/combos/archer__plate__sword.png"),
  "knight__chain__bow": require("../assets/generated/combos/knight__chain__bow.png"),
  "knight__chain__none": require("../assets/generated/combos/knight__chain__none.png"),
  "knight__chain__staff": require("../assets/generated/combos/knight__chain__staff.png"),
  "knight__chain__sword": require("../assets/generated/combos/knight__chain__sword.png"),
  "knight__leather__bow": require("../assets/generated/combos/knight__leather__bow.png"),
  "knight__leather__none": require("../assets/generated/combos/knight__leather__none.png"),
  "knight__leather__staff": require("../assets/generated/combos/knight__leather__staff.png"),
  "knight__leather__sword": require("../assets/generated/combos/knight__leather__sword.png"),
  "knight__none__bow": require("../assets/generated/combos/knight__none__bow.png"),
  "knight__none__staff": require("../assets/generated/combos/knight__none__staff.png"),
  "knight__none__sword": require("../assets/generated/combos/knight__none__sword.png"),
  "knight__plate__bow": require("../assets/generated/combos/knight__plate__bow.png"),
  "knight__plate__none": require("../assets/generated/combos/knight__plate__none.png"),
  "knight__plate__staff": require("../assets/generated/combos/knight__plate__staff.png"),
  "knight__plate__sword": require("../assets/generated/combos/knight__plate__sword.png"),
  "mage__chain__bow": require("../assets/generated/combos/mage__chain__bow.png"),
  "mage__chain__none": require("../assets/generated/combos/mage__chain__none.png"),
  "mage__chain__staff": require("../assets/generated/combos/mage__chain__staff.png"),
  "mage__chain__sword": require("../assets/generated/combos/mage__chain__sword.png"),
  "mage__leather__bow": require("../assets/generated/combos/mage__leather__bow.png"),
  "mage__leather__none": require("../assets/generated/combos/mage__leather__none.png"),
  "mage__leather__staff": require("../assets/generated/combos/mage__leather__staff.png"),
  "mage__leather__sword": require("../assets/generated/combos/mage__leather__sword.png"),
  "mage__none__bow": require("../assets/generated/combos/mage__none__bow.png"),
  "mage__none__staff": require("../assets/generated/combos/mage__none__staff.png"),
  "mage__none__sword": require("../assets/generated/combos/mage__none__sword.png"),
  "mage__plate__bow": require("../assets/generated/combos/mage__plate__bow.png"),
  "mage__plate__none": require("../assets/generated/combos/mage__plate__none.png"),
  "mage__plate__staff": require("../assets/generated/combos/mage__plate__staff.png"),
  "mage__plate__sword": require("../assets/generated/combos/mage__plate__sword.png"),
  "ninja__chain__bow": require("../assets/generated/combos/ninja__chain__bow.png"),
  "ninja__chain__none": require("../assets/generated/combos/ninja__chain__none.png"),
  "ninja__chain__staff": require("../assets/generated/combos/ninja__chain__staff.png"),
  "ninja__chain__sword": require("../assets/generated/combos/ninja__chain__sword.png"),
  "ninja__leather__bow": require("../assets/generated/combos/ninja__leather__bow.png"),
  "ninja__leather__none": require("../assets/generated/combos/ninja__leather__none.png"),
  "ninja__leather__staff": require("../assets/generated/combos/ninja__leather__staff.png"),
  "ninja__leather__sword": require("../assets/generated/combos/ninja__leather__sword.png"),
  "ninja__none__bow": require("../assets/generated/combos/ninja__none__bow.png"),
  "ninja__none__staff": require("../assets/generated/combos/ninja__none__staff.png"),
  "ninja__none__sword": require("../assets/generated/combos/ninja__none__sword.png"),
  "ninja__plate__bow": require("../assets/generated/combos/ninja__plate__bow.png"),
  "ninja__plate__none": require("../assets/generated/combos/ninja__plate__none.png"),
  "ninja__plate__staff": require("../assets/generated/combos/ninja__plate__staff.png"),
  "ninja__plate__sword": require("../assets/generated/combos/ninja__plate__sword.png"),
  "vampire__chain__bow": require("../assets/generated/combos/vampire__chain__bow.png"),
  "vampire__chain__none": require("../assets/generated/combos/vampire__chain__none.png"),
  "vampire__chain__staff": require("../assets/generated/combos/vampire__chain__staff.png"),
  "vampire__chain__sword": require("../assets/generated/combos/vampire__chain__sword.png"),
  "vampire__leather__bow": require("../assets/generated/combos/vampire__leather__bow.png"),
  "vampire__leather__none": require("../assets/generated/combos/vampire__leather__none.png"),
  "vampire__leather__staff": require("../assets/generated/combos/vampire__leather__staff.png"),
  "vampire__leather__sword": require("../assets/generated/combos/vampire__leather__sword.png"),
  "vampire__none__bow": require("../assets/generated/combos/vampire__none__bow.png"),
  "vampire__none__staff": require("../assets/generated/combos/vampire__none__staff.png"),
  "vampire__none__sword": require("../assets/generated/combos/vampire__none__sword.png"),
  "vampire__plate__bow": require("../assets/generated/combos/vampire__plate__bow.png"),
  "vampire__plate__none": require("../assets/generated/combos/vampire__plate__none.png"),
  "vampire__plate__staff": require("../assets/generated/combos/vampire__plate__staff.png"),
  "vampire__plate__sword": require("../assets/generated/combos/vampire__plate__sword.png"),
};

export function comboAssetFor(
  charClass: string | undefined | null,
  armorIconKey?: string | null,
  weaponIconKey?: string | null,
): ImageSourcePropType | null {
  const cls = (charClass ?? "knight") as CharacterId;
  const a = COMBO_ARMORS.has(armorIconKey ?? "") ? (armorIconKey as string) : "none";
  const w = COMBO_WEAPONS.has(weaponIconKey ?? "") ? (weaponIconKey as string) : "none";
  if (a === "none" && w === "none") {
    return CHARACTER_ASSETS[cls] ?? CHARACTER_ASSETS.knight;
  }
  return COMBO_ASSETS[`${cls}__${a}__${w}`] ?? CHARACTER_ASSETS[cls] ?? CHARACTER_ASSETS.knight;
}
