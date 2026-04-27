import { equipBonus, makeEquipment, NAME_PARTS_A, NAME_PARTS_B, NAME_SUFFIX_NUMS, GUILDS, PET_LIBRARY } from "./data";
import type { AvatarStyle, BattleEvent, BattleResult, CharClass, CombatantId, Equipment, EquipSlot, Pet, Player, Stats, Tier } from "./types";

/** Active pets — supports the new array form, falls back to legacy single pet. */
export function activePetsOf(p: Player | null | undefined): Pet[] {
  if (!p) return [];
  if (p.pets && p.pets.length > 0) return p.pets;
  if (p.pet) return [p.pet];
  return [];
}

const CHAR_CLASSES: CharClass[] = ["knight", "ninja", "mage", "archer", "vampire"];

export function classLabel(c?: CharClass | string | null): string {
  if (!c) return "Adventurer";
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export function powerOf(p: Player): number {
  const s = totalStats(p);
  return Math.round(s.str * 2 + s.agl * 1.2 + s.spd * 1.0 + s.hp * 0.3);
}

export const SLOTS: EquipSlot[] = ["weapon", "helmet", "chest", "gloves", "boots", "accessory"];

export function baseStats(level: number): Stats {
  return {
    hp: 100 + level * 30,
    str: 10 + level * 2,
    agl: 10 + Math.round(level * 3.2),
    spd: 10 + Math.round(level * 2.6),
  };
}

export function totalStats(p: Player): Stats {
  const base = baseStats(p.level);
  let { hp, str, agl, spd } = base;
  // try shop catalog bonuses first; fall back to tier-based equipBonus
  // (lazy import to avoid circular deps)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { bonusFor } = require("./shop") as typeof import("./shop");
  for (const slot of SLOTS) {
    const eq = p.equipment[slot];
    if (eq) {
      const shopBonus = bonusFor(eq);
      const b = (shopBonus.hp || shopBonus.str || shopBonus.agl || shopBonus.spd)
        ? shopBonus
        : equipBonus(slot, eq.tier);
      hp += b.hp; str += b.str; agl += b.agl; spd += b.spd;
    }
  }
  for (const pet of activePetsOf(p)) {
    hp += pet.bonusStats.hp;
    str += pet.bonusStats.str;
    agl += pet.bonusStats.agl;
    spd += pet.bonusStats.spd;
  }
  return { hp, str, agl, spd };
}

export function petCombatStats(p: Player): Stats | null {
  const first = activePetsOf(p)[0];
  if (!first) return null;
  return petCombatStatsOf(p, first);
}

export function petCombatStatsOf(p: Player, pet: Pet): Stats {
  const s = pet.bonusStats;
  const lvlMult = 1 + p.level * 0.05;
  return {
    hp: Math.round(s.hp * lvlMult * 1.5),
    str: Math.round(s.str * lvlMult),
    agl: Math.round(s.agl * lvlMult),
    spd: Math.round(s.spd * lvlMult),
  };
}

export function xpForLevel(level: number): number {
  return Math.round(50 * Math.pow(level, 1.6));
}

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const STYLES: AvatarStyle[] = ["lorelei", "adventurer", "micah", "personas", "notionists"];

export function generateOpponent(seed: string, playerLevel: number): Player {
  const r = rng(hashString(seed));
  const level = Math.max(1, playerLevel + Math.floor(r() * 7) - 3);
  const a = NAME_PARTS_A[Math.floor(r() * NAME_PARTS_A.length)];
  const b = NAME_PARTS_B[Math.floor(r() * NAME_PARTS_B.length)];
  const num = NAME_SUFFIX_NUMS[Math.floor(r() * NAME_SUFFIX_NUMS.length)];
  const name = `${a}${b}${num}`;

  const equipment: Record<EquipSlot, Equipment | null> = {
    weapon: null, helmet: null, chest: null, gloves: null, boots: null, accessory: null,
  };
  const tierBudget = Math.min(5, Math.max(1, Math.floor(level / 8) + Math.floor(r() * 2)));
  for (const slot of SLOTS) {
    const variance = Math.floor(r() * 3) - 1;
    const t = Math.max(1, Math.min(5, tierBudget + variance)) as Tier;
    equipment[slot] = makeEquipment(slot, t);
  }

  const wins = Math.floor(r() * level * 5);
  const losses = Math.floor(r() * level * 3);

  const petCount = level >= 10 ? (r() < 0.4 ? 2 : 1) : (r() > 0.15 ? 1 : 0);
  const opponentPets = [] as Pet[];
  for (let i = 0; i < petCount; i++) {
    const tpl = PET_LIBRARY[Math.floor(r() * PET_LIBRARY.length)];
    opponentPets.push({ ...tpl, level: Math.max(1, level - Math.floor(r() * 5)) });
  }

  const guild = r() > 0.4 ? GUILDS[Math.floor(r() * GUILDS.length)] : undefined;

  return {
    id: `npc-${seed}`,
    name,
    level,
    xp: 0,
    gold: 0,
    crystals: 0,
    wins,
    losses,
    avatarSeed: seed,
    avatarStyle: STYLES[Math.floor(r() * STYLES.length)],
    charClass: CHAR_CLASSES[Math.floor(r() * CHAR_CLASSES.length)],
    equipment,
    pets: opponentPets,
    pet: opponentPets[0] ?? null,
    guild,
  };
}

export function generateOpponentList(playerLevel: number, count = 6, salt = ""): Player[] {
  const list: Player[] = [];
  const stamp = Math.floor(Date.now() / 1000) + salt.length;
  for (let i = 0; i < count; i++) {
    list.push(generateOpponent(`${stamp}-${i}-${salt}`, playerLevel));
  }
  return list;
}

export function simulateBattle(p1: Player, p2: Player, seed = Math.random() * 1e9): BattleResult {
  const r = rng(seed | 0);
  const s1 = totalStatsNoPet(p1);
  const s2 = totalStatsNoPet(p2);
  const p1Pets = activePetsOf(p1);
  const p2Pets = activePetsOf(p2);
  const p1PetStats = p1Pets.map((pt) => petCombatStatsOf(p1, pt));
  const p2PetStats = p2Pets.map((pt) => petCombatStatsOf(p2, pt));

  // Combatant id helpers
  const P1 = "p1";
  const P2 = "p2";
  const p1PetId = (i: number) => `p1_pet_${i}`;
  const p2PetId = (i: number) => `p2_pet_${i}`;

  // HP map keyed by combatant id
  const hps: Record<CombatantId, number> = {
    [P1]: s1.hp,
    [P2]: s2.hp,
  };
  p1PetStats.forEach((st, i) => { hps[p1PetId(i)] = st.hp; });
  p2PetStats.forEach((st, i) => { hps[p2PetId(i)] = st.hp; });

  const statsOf = (id: CombatantId): Stats => {
    if (id === P1) return s1;
    if (id === P2) return s2;
    if (id.startsWith("p1_pet_")) return p1PetStats[Number(id.slice(7))];
    return p2PetStats[Number(id.slice(7))];
  };
  const sideOf = (id: CombatantId): "p1" | "p2" => id.startsWith("p1") ? "p1" : "p2";
  const isPet = (id: CombatantId) => id.includes("_pet_");
  const aliveOnSide = (side: "p1" | "p2"): CombatantId[] => {
    const main = side === "p1" ? P1 : P2;
    const pets = side === "p1" ? p1Pets.map((_, i) => p1PetId(i)) : p2Pets.map((_, i) => p2PetId(i));
    return [main, ...pets].filter((id) => hps[id] > 0);
  };

  // Strict alternation per the user's spec: p1 → p1.pets... → p2 → p2.pets... → repeat.
  const order: CombatantId[] = [
    P1,
    ...p1Pets.map((_, i) => p1PetId(i)),
    P2,
    ...p2Pets.map((_, i) => p2PetId(i)),
  ];

  const events: BattleEvent[] = [];
  events.push({ t: "start", attacker: P1, target: P2, hps: { ...hps }, msg: "Battle begin" });

  let round = 0;
  const maxRounds = 60;
  const mainAlive = () => hps[P1] > 0 && hps[P2] > 0;

  while (mainAlive() && round < maxRounds) {
    round++;
    for (const who of order) {
      if (!mainAlive()) break;
      if (hps[who] <= 0) continue;

      // Pick target: pets prefer enemy pets first, fall back to enemy main.
      // Mains always target enemy main.
      const enemySide: "p1" | "p2" = sideOf(who) === "p1" ? "p2" : "p1";
      let target: CombatantId;
      if (isPet(who)) {
        const enemyPetsAlive = aliveOnSide(enemySide).filter(isPet);
        target = enemyPetsAlive[0] ?? (enemySide === "p1" ? P1 : P2);
      } else {
        target = enemySide === "p1" ? P1 : P2;
      }

      const attackerStats = statsOf(who);
      const defenderStats = statsOf(target);

      const dodgeChance = Math.min(0.4, defenderStats.agl / (defenderStats.agl + attackerStats.agl * 1.6 + 50));
      if (r() < dodgeChance) {
        events.push({ t: "dodge", attacker: who, target, hps: { ...hps } });
        continue;
      }

      const mitigation = defenderStats.agl / (defenderStats.agl + attackerStats.str * 1.2 + 80);
      const variance = 0.70 + r() * 0.55;
      const luckyStrike = r() < 0.06 ? 1.5 : 1;
      const baseDamage = attackerStats.str * (1 - mitigation) * variance * luckyStrike;
      const critChance = Math.min(0.30, 0.05 + Math.max(0, attackerStats.spd - defenderStats.spd) / (defenderStats.spd + 200));
      const isCrit = r() < critChance;
      const damage = Math.max(1, Math.round(baseDamage * (isCrit ? 1.7 : 1)));

      hps[target] = Math.max(0, hps[target] - damage);

      events.push({
        t: isCrit ? "crit" : (isPet(who) ? "pet_attack" : "attack"),
        attacker: who,
        target,
        damage,
        hps: { ...hps },
      });

      if (hps[target] === 0 && isPet(target)) {
        events.push({ t: "death", attacker: who, target, hps: { ...hps } });
      }
    }
  }

  const winner: "p1" | "p2" = hps[P1] > hps[P2] ? "p1" : "p2";
  events.push({ t: "end", attacker: winner, target: winner === "p1" ? P2 : P1, hps: { ...hps } });

  return { events, winner, rounds: round };
}

/** Total stats from base + equipment, but WITHOUT pet bonuses (pets fight independently now). */
function totalStatsNoPet(p: Player): Stats {
  const base = baseStats(p.level);
  let { hp, str, agl, spd } = base;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { bonusFor } = require("./shop") as typeof import("./shop");
  for (const slot of SLOTS) {
    const eq = p.equipment[slot];
    if (eq) {
      const shopBonus = bonusFor(eq);
      const b = (shopBonus.hp || shopBonus.str || shopBonus.agl || shopBonus.spd)
        ? shopBonus
        : equipBonus(slot, eq.tier);
      hp += b.hp; str += b.str; agl += b.agl; spd += b.spd;
    }
  }
  return { hp, str, agl, spd };
}

export function applyWinReward(p: Player, opponentLevel: number): Player {
  const xpGain = 20 + opponentLevel * 8;
  const goldGain = 50 + opponentLevel * 12 + Math.floor(Math.random() * 30);
  const crystalGain = Math.random() < 0.25 ? 1 : 0;

  let xp = p.xp + xpGain;
  let level = p.level;
  while (xp >= xpForLevel(level)) {
    xp -= xpForLevel(level);
    level += 1;
  }

  return {
    ...p,
    xp,
    level,
    gold: p.gold + goldGain,
    crystals: p.crystals + crystalGain,
    wins: p.wins + 1,
  };
}

export function applyLoss(p: Player): Player {
  const goldLoss = Math.min(p.gold, 10 + p.level * 2);
  return {
    ...p,
    gold: p.gold - goldLoss,
    losses: p.losses + 1,
  };
}

export function tierUpgradeCost(currentTier: Tier): { gold: number; crystals: number } {
  const t = currentTier;
  return {
    gold: 100 * Math.pow(3, t),
    crystals: t === 0 ? 0 : t,
  };
}

function _ignored(p: Player): number {
  const s = totalStats(p);
  return Math.round(s.hp / 4 + s.str * 3 + s.agl * 2 + s.spd * 2);
}
