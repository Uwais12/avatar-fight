import type { Equipment, EquipSlot, Pet, PetKind, Stats, Tier } from "./types";

export type ShopWeapon = {
  id: string;
  name: string;
  iconKey: "sword" | "bow" | "staff" | "axe" | "mace" | "dagger";
  slot: "weapon";
  tier: Tier;
  price: number;
  bonus: Stats;
};

export type ShopArmor = {
  id: string;
  name: string;
  iconKey: "leather" | "chain" | "plate" | "robe";
  slot: EquipSlot;
  tier: Tier;
  price: number;
  bonus: Stats;
};

export type SpriteKey = "ember-wyrm" | "frost-drake" | "war-wolf" | "battle-cat" | "thunder-bird";

export type ShopPet = {
  id: string;
  name: string;
  spriteKey: SpriteKey;
  kind: SpriteKey;
  price: number;
  bonus: Stats;
};

export const WEAPON_CATALOG: ShopWeapon[] = [
  { id: "w-dagger-1", name: "Rusty Dagger", iconKey: "dagger", slot: "weapon", tier: 1 as Tier, price: 80, bonus: { hp: 0, str: 8, agl: 4, spd: 6 } },
  { id: "w-mace-1", name: "Wooden Mace", iconKey: "mace", slot: "weapon", tier: 1 as Tier, price: 150, bonus: { hp: 10, str: 14, agl: 0, spd: 0 } },
  { id: "w-axe-1", name: "Hatchet", iconKey: "axe", slot: "weapon", tier: 2 as Tier, price: 320, bonus: { hp: 15, str: 22, agl: 4, spd: 2 } },
  { id: "w-bow-1", name: "Hunter Bow", iconKey: "bow", slot: "weapon", tier: 2 as Tier, price: 520, bonus: { hp: 0, str: 18, agl: 14, spd: 16 } },
  { id: "w-sword-1", name: "Iron Sword", iconKey: "sword", slot: "weapon", tier: 3 as Tier, price: 880, bonus: { hp: 20, str: 35, agl: 10, spd: 8 } },
  { id: "w-staff-1", name: "Apprentice Staff", iconKey: "staff", slot: "weapon", tier: 3 as Tier, price: 1100, bonus: { hp: 30, str: 42, agl: 18, spd: 6 } },
  { id: "w-bow-2", name: "Elven Longbow", iconKey: "bow", slot: "weapon", tier: 4 as Tier, price: 2200, bonus: { hp: 25, str: 50, agl: 38, spd: 42 } },
  { id: "w-sword-2", name: "Knight Blade", iconKey: "sword", slot: "weapon", tier: 4 as Tier, price: 3400, bonus: { hp: 60, str: 80, agl: 25, spd: 22 } },
  { id: "w-staff-2", name: "Archmage Staff", iconKey: "staff", slot: "weapon", tier: 5 as Tier, price: 6800, bonus: { hp: 80, str: 130, agl: 60, spd: 30 } },
  { id: "w-sword-3", name: "Dragon Slayer", iconKey: "sword", slot: "weapon", tier: 5 as Tier, price: 12000, bonus: { hp: 150, str: 220, agl: 70, spd: 60 } },
];

export const ARMOR_CATALOG: ShopArmor[] = [
  // helmets
  { id: "a-helm-leather", name: "Leather Hood", iconKey: "leather", slot: "helmet", tier: 1 as Tier, price: 100, bonus: { hp: 30, str: 0, agl: 4, spd: 0 } },
  { id: "a-helm-chain", name: "Iron Helm", iconKey: "chain", slot: "helmet", tier: 3 as Tier, price: 700, bonus: { hp: 100, str: 5, agl: 12, spd: 0 } },
  { id: "a-helm-plate", name: "Knight Crown", iconKey: "plate", slot: "helmet", tier: 5 as Tier, price: 5500, bonus: { hp: 320, str: 25, agl: 40, spd: 0 } },
  // chest
  { id: "a-chest-leather", name: "Leather Vest", iconKey: "leather", slot: "chest", tier: 1 as Tier, price: 180, bonus: { hp: 60, str: 0, agl: 8, spd: 0 } },
  { id: "a-chest-chain", name: "Chainmail", iconKey: "chain", slot: "chest", tier: 3 as Tier, price: 1200, bonus: { hp: 200, str: 12, agl: 20, spd: 0 } },
  { id: "a-chest-plate", name: "Plate Armor", iconKey: "plate", slot: "chest", tier: 5 as Tier, price: 9000, bonus: { hp: 600, str: 60, agl: 60, spd: 0 } },
  // boots
  { id: "a-boots-leather", name: "Leather Boots", iconKey: "leather", slot: "boots", tier: 1 as Tier, price: 90, bonus: { hp: 20, str: 0, agl: 6, spd: 12 } },
  { id: "a-boots-chain", name: "Iron Greaves", iconKey: "chain", slot: "boots", tier: 3 as Tier, price: 680, bonus: { hp: 70, str: 5, agl: 18, spd: 35 } },
  { id: "a-boots-plate", name: "Sky Boots", iconKey: "plate", slot: "boots", tier: 5 as Tier, price: 5400, bonus: { hp: 200, str: 18, agl: 60, spd: 120 } },
  // accessory (use robe icon)
  { id: "a-acc-1", name: "Cloth Charm", iconKey: "robe", slot: "accessory", tier: 1 as Tier, price: 60, bonus: { hp: 10, str: 4, agl: 4, spd: 4 } },
  { id: "a-acc-2", name: "Mage Robe Sash", iconKey: "robe", slot: "accessory", tier: 3 as Tier, price: 900, bonus: { hp: 80, str: 18, agl: 18, spd: 18 } },
  { id: "a-acc-3", name: "Royal Sigil", iconKey: "robe", slot: "accessory", tier: 5 as Tier, price: 7200, bonus: { hp: 400, str: 60, agl: 60, spd: 60 } },
  // gloves (no dedicated icon, use leather)
  { id: "a-gloves-1", name: "Hand Wraps", iconKey: "leather", slot: "gloves", tier: 1 as Tier, price: 70, bonus: { hp: 15, str: 6, agl: 4, spd: 4 } },
  { id: "a-gloves-2", name: "Iron Gauntlets", iconKey: "chain", slot: "gloves", tier: 3 as Tier, price: 600, bonus: { hp: 60, str: 25, agl: 12, spd: 8 } },
  { id: "a-gloves-3", name: "Dragon Grips", iconKey: "plate", slot: "gloves", tier: 5 as Tier, price: 4800, bonus: { hp: 220, str: 90, agl: 40, spd: 30 } },
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

export function findWeaponByName(name: string): ShopWeapon | undefined {
  return WEAPON_CATALOG.find((w) => w.name === name);
}

export function findArmorByName(name: string, slot: EquipSlot): ShopArmor | undefined {
  return ARMOR_CATALOG.find((a) => a.name === name && a.slot === slot);
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
