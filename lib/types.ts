export type Stats = {
  hp: number;
  str: number;
  agl: number;
  spd: number;
};

export type Tier = 0 | 1 | 2 | 3 | 4 | 5;

export const TIER_NAMES = ["None", "Leather", "Forged", "Steel", "Chrome", "Gold", "Supreme"] as const;
export const TIER_COLORS = ["#94928a", "#a07050", "#9aa0a6", "#c4c4c8", "#a8e0ff", "#f5d050", "#e070ff"] as const;

export type EquipSlot = "weapon" | "helmet" | "chest" | "gloves" | "boots" | "accessory";

export type Equipment = {
  slot: EquipSlot;
  tier: Tier;
  name: string;
  iconKey: string;
};

export type PetKind = "red-dragon" | "blue-dragon" | "wolf" | "tiger" | "eagle";

export type Pet = {
  id: string;
  name: string;
  spriteKey: string;
  kind?: PetKind;
  bonusStats: Stats;
  level: number;
};

export type AvatarStyle = "lorelei" | "adventurer" | "micah" | "personas" | "notionists";

export type CharClass = "knight" | "ninja" | "mage" | "archer" | "vampire";

export type Player = {
  id: string;
  name: string;
  level: number;
  xp: number;
  gold: number;
  crystals: number;
  wins: number;
  losses: number;
  avatarSeed: string;
  avatarStyle: AvatarStyle;
  charClass?: CharClass;
  onboarded?: boolean;
  equipment: Record<EquipSlot, Equipment | null>;
  pet: Pet | null;
  guild?: string;
};

export type BattleEventType =
  | "start"
  | "attack"
  | "dodge"
  | "crit"
  | "pet_attack"
  | "end";

export type BattleEvent = {
  t: BattleEventType;
  attacker: "p1" | "p2" | "pet1" | "pet2";
  target: "p1" | "p2";
  damage?: number;
  hp1After: number;
  hp2After: number;
  msg?: string;
};

export type BattleResult = {
  events: BattleEvent[];
  winner: "p1" | "p2";
  rounds: number;
};
