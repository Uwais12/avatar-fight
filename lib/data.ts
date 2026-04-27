import type { Equipment, EquipSlot, Pet, Stats, Tier } from "./types";

export const WEAPON_NAMES = [
  ["Wooden Stick", "Rusty Blade", "Bone Club", "Old Bow", "Apprentice Wand"],
  ["Iron Sword", "Steel Axe", "Hunter Bow", "Battle Mace", "Oak Staff"],
  ["Knight Sword", "War Hammer", "Elven Bow", "Spear of Dawn", "Mage Staff"],
  ["Chrome Edge", "Twin Daggers", "Crystal Bow", "Frost Lance", "Storm Wand"],
  ["Gold Slayer", "Sun Hammer", "Phoenix Bow", "Dragon Spear", "Arcane Rod"],
  ["Dragon Destroyer", "World Splitter", "Hell Ice Bow", "Lance of Heaven", "Void Scepter"],
];

export const ARMOR_NAMES: Record<EquipSlot, string[][]> = {
  weapon: WEAPON_NAMES,
  helmet: [
    ["Cloth Cap", "Hood"],
    ["Leather Helm", "Iron Cap"],
    ["Knight Helm", "Hunter Hood"],
    ["Chrome Helm", "Mystic Hood"],
    ["Gold Crown", "Sun Visor"],
    ["Supreme Crown", "Dragonscale Helm"],
  ],
  chest: [
    ["Cloth Tunic", "Worn Vest"],
    ["Leather Vest", "Padded Mail"],
    ["Knight Plate", "Hunter Garb"],
    ["Chrome Plate", "Battle Robe"],
    ["Gold Plate", "Sun Vestment"],
    ["Supreme Plate", "Dragon Scale"],
  ],
  gloves: [
    ["Cloth Wraps", "Worn Gloves"],
    ["Leather Gloves", "Padded Mitts"],
    ["Knight Gauntlets", "Hunter Grips"],
    ["Chrome Gauntlets", "Mystic Wraps"],
    ["Gold Gauntlets", "Sun Gloves"],
    ["Supreme Gauntlets", "Dragon Grips"],
  ],
  boots: [
    ["Cloth Shoes", "Worn Boots"],
    ["Leather Boots", "Padded Shoes"],
    ["Knight Boots", "Hunter Boots"],
    ["Chrome Boots", "Mystic Sandals"],
    ["Gold Boots", "Sun Greaves"],
    ["Supreme Boots", "Dragon Greaves"],
  ],
  accessory: [
    ["Wooden Charm", "Cord Necklace"],
    ["Iron Ring", "Bone Amulet"],
    ["Silver Ring", "Hunter Amulet"],
    ["Chrome Band", "Crystal Pendant"],
    ["Gold Ring", "Sun Pendant"],
    ["Supreme Ring", "Dragon Pendant"],
  ],
};

export const PET_LIBRARY: Omit<Pet, "level">[] = [
  { id: "ember-wyrm", name: "Ember Wyrm", spriteKey: "dragon-red", bonusStats: { hp: 200, str: 50, agl: 80, spd: 30 } },
  { id: "frost-drake", name: "Frost Drake", spriteKey: "dragon-blue", bonusStats: { hp: 280, str: 30, agl: 60, spd: 50 } },
  { id: "shadow-wyvern", name: "Shadow Wyvern", spriteKey: "dragon-purple", bonusStats: { hp: 220, str: 60, agl: 70, spd: 40 } },
  { id: "moss-serpent", name: "Moss Serpent", spriteKey: "dragon-green", bonusStats: { hp: 250, str: 40, agl: 90, spd: 30 } },
  { id: "war-wolf", name: "War Wolf", spriteKey: "wolf", bonusStats: { hp: 180, str: 70, agl: 50, spd: 60 } },
  { id: "battle-cat", name: "Battle Cat", spriteKey: "cat", bonusStats: { hp: 160, str: 45, agl: 100, spd: 70 } },
  { id: "iron-boar", name: "Iron Boar", spriteKey: "boar", bonusStats: { hp: 320, str: 55, agl: 40, spd: 25 } },
  { id: "spirit-fox", name: "Spirit Fox", spriteKey: "fox", bonusStats: { hp: 170, str: 55, agl: 85, spd: 75 } },
  { id: "stone-golem", name: "Stone Golem", spriteKey: "golem", bonusStats: { hp: 380, str: 75, agl: 30, spd: 15 } },
  { id: "thunder-bird", name: "Thunder Bird", spriteKey: "bird", bonusStats: { hp: 150, str: 50, agl: 75, spd: 95 } },
];

export const NAME_PARTS_A = [
  "Dark", "Iron", "Sun", "Moon", "Storm", "Frost", "Ember", "Shadow", "Wild", "Steel",
  "Crimson", "Silver", "Golden", "Mystic", "Savage", "Holy", "Void", "Dragon", "Wolf", "Phoenix",
];
export const NAME_PARTS_B = [
  "blade", "fang", "claw", "heart", "fist", "soul", "edge", "rider", "lord", "bane",
  "storm", "fire", "ice", "wing", "scale", "mane", "shroud", "eye", "wraith", "knight",
];
export const NAME_SUFFIX_NUMS = [7, 13, 21, 42, 88, 99, 101, 365, 777, 999];

export const GUILDS = [
  "Dragon's Maw", "Iron Wolves", "Crimson Order", "Silver Dawn", "Void Hunters",
  "Storm Riders", "Sunblade Pact", "The Last Bastion", "Frostbite Clan", "Black Lotus",
];

export const TIER_NAME = (slot: EquipSlot, tier: Tier): string => {
  if (tier === 0) return "None";
  const list = ARMOR_NAMES[slot][tier - 1];
  return list[Math.floor(Math.random() * list.length)];
};

export const ICON_BY_SLOT: Record<EquipSlot, string> = {
  weapon: "Swords",
  helmet: "HardHat",
  chest: "Shirt",
  gloves: "Hand",
  boots: "Footprints",
  accessory: "Gem",
};

const slotMultipliers: Record<EquipSlot, Stats> = {
  weapon: { hp: 0, str: 1.0, agl: 0, spd: 0 },
  helmet: { hp: 0.4, str: 0, agl: 0.3, spd: 0 },
  chest: { hp: 0.7, str: 0, agl: 0.4, spd: 0 },
  gloves: { hp: 0.2, str: 0.2, agl: 0.2, spd: 0.1 },
  boots: { hp: 0.2, str: 0, agl: 0.2, spd: 0.6 },
  accessory: { hp: 0.3, str: 0.2, agl: 0.2, spd: 0.2 },
};

export function equipBonus(slot: EquipSlot, tier: Tier): Stats {
  if (tier === 0) return { hp: 0, str: 0, agl: 0, spd: 0 };
  const m = slotMultipliers[slot];
  const tierMult = tier * 0.35;
  return {
    hp: Math.round(m.hp * tierMult * 100),
    str: Math.round(m.str * tierMult * 30),
    agl: Math.round(m.agl * tierMult * 60),
    spd: Math.round(m.spd * tierMult * 50),
  };
}

export function makeEquipment(slot: EquipSlot, tier: Tier): Equipment | null {
  if (tier === 0) return null;
  return {
    slot,
    tier,
    name: TIER_NAME(slot, tier),
    iconKey: ICON_BY_SLOT[slot],
  };
}
