import type { Equipment, EquipSlot, Pet, PetKind, Stats, Tier } from "./types";

export type WeaponIcon = "dagger" | "mace" | "axe" | "bow" | "sword" | "staff";
export type ArmorIcon = "leather" | "chain" | "plate" | "robe";
export type SpriteKey = "battle-cat" | "war-wolf" | "thunder-bird" | "ember-wyrm" | "frost-drake";

export type ShopWeapon = {
  id: string;
  name: string;
  iconKey: WeaponIcon;
  slot: "weapon";
  tier: Tier;
  price: number;
  bonus: Stats;
};

export type ShopArmor = {
  id: string;
  name: string;
  iconKey: ArmorIcon;
  slot: EquipSlot;
  tier: Tier;
  price: number;
  bonus: Stats;
};

export type ShopPet = {
  id: string;
  name: string;
  spriteKey: SpriteKey;
  kind: SpriteKey;
  price: number;
  bonus: Stats;
};

// Exactly one item per generated weapon icon (cheapest → priciest)
export const WEAPON_CATALOG: ShopWeapon[] = [
  { id: "w-dagger", name: "Shadow Dagger", iconKey: "dagger", slot: "weapon", tier: 1 as Tier, price: 100, bonus: { hp: 0, str: 12, agl: 8, spd: 12 } },
  { id: "w-mace", name: "Iron Mace", iconKey: "mace", slot: "weapon", tier: 2 as Tier, price: 350, bonus: { hp: 30, str: 28, agl: 0, spd: 0 } },
  { id: "w-axe", name: "Battle Axe", iconKey: "axe", slot: "weapon", tier: 3 as Tier, price: 900, bonus: { hp: 60, str: 55, agl: 10, spd: 8 } },
  { id: "w-bow", name: "Hunter Bow", iconKey: "bow", slot: "weapon", tier: 3 as Tier, price: 1400, bonus: { hp: 20, str: 45, agl: 35, spd: 40 } },
  { id: "w-sword", name: "Knight Sword", iconKey: "sword", slot: "weapon", tier: 4 as Tier, price: 3600, bonus: { hp: 80, str: 110, agl: 30, spd: 25 } },
  { id: "w-staff", name: "Archmage Staff", iconKey: "staff", slot: "weapon", tier: 5 as Tier, price: 9000, bonus: { hp: 200, str: 220, agl: 90, spd: 60 } },
];

// Exactly one item per generated armor icon — all chest slot for now.
export const ARMOR_CATALOG: ShopArmor[] = [
  { id: "a-leather", name: "Leather Vest", iconKey: "leather", slot: "chest", tier: 1 as Tier, price: 180, bonus: { hp: 80, str: 0, agl: 10, spd: 4 } },
  { id: "a-chain", name: "Chainmail", iconKey: "chain", slot: "chest", tier: 3 as Tier, price: 1100, bonus: { hp: 280, str: 15, agl: 25, spd: 0 } },
  { id: "a-plate", name: "Plate Armor", iconKey: "plate", slot: "chest", tier: 5 as Tier, price: 8500, bonus: { hp: 800, str: 80, agl: 70, spd: 0 } },
  { id: "a-robe", name: "Mage Robe", iconKey: "robe", slot: "chest", tier: 4 as Tier, price: 3200, bonus: { hp: 200, str: 60, agl: 50, spd: 30 } },
];

export const PET_CATALOG: ShopPet[] = [
  { id: "p-cat", name: "Battle Cat", spriteKey: "battle-cat", kind: "battle-cat", price: 600, bonus: { hp: 80, str: 12, agl: 30, spd: 25 } },
  { id: "p-wolf", name: "War Wolf", spriteKey: "war-wolf", kind: "war-wolf", price: 1800, bonus: { hp: 180, str: 45, agl: 35, spd: 25 } },
  { id: "p-eagle", name: "Thunder Eagle", spriteKey: "thunder-bird", kind: "thunder-bird", price: 3200, bonus: { hp: 150, str: 35, agl: 60, spd: 95 } },
  { id: "p-emberwyrm", name: "Ember Wyrm", spriteKey: "ember-wyrm", kind: "ember-wyrm", price: 6000, bonus: { hp: 300, str: 90, agl: 50, spd: 30 } },
  { id: "p-frostdrake", name: "Frost Drake", spriteKey: "frost-drake", kind: "frost-drake", price: 11000, bonus: { hp: 600, str: 120, agl: 100, spd: 80 } },
];

export function shopWeaponToEquipment(w: ShopWeapon): Equipment {
  return { slot: "weapon", tier: w.tier, name: w.name, iconKey: w.iconKey };
}

export function shopArmorToEquipment(a: ShopArmor): Equipment {
  return { slot: a.slot, tier: a.tier, name: a.name, iconKey: a.iconKey };
}

export function shopPetToPet(p: ShopPet): Pet {
  return {
    id: p.id,
    name: p.name,
    spriteKey: p.spriteKey,
    kind: p.kind as unknown as PetKind,
    bonusStats: p.bonus,
    level: 1,
  };
}

export function bonusFor(eq: Equipment | null): Stats {
  if (!eq) return { hp: 0, str: 0, agl: 0, spd: 0 };
  if (eq.slot === "weapon") {
    const w = WEAPON_CATALOG.find((x) => x.name === eq.name);
    if (w) return w.bonus;
  } else {
    const a = ARMOR_CATALOG.find((x) => x.name === eq.name && x.slot === eq.slot);
    if (a) return a.bonus;
  }
  return { hp: 0, str: 0, agl: 0, spd: 0 };
}
