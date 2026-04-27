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
