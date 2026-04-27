import { equipBonus, makeEquipment, NAME_PARTS_A, NAME_PARTS_B, NAME_SUFFIX_NUMS, GUILDS, PET_LIBRARY } from "./data";
import type { AvatarStyle, BattleEvent, BattleResult, CharClass, Equipment, EquipSlot, Player, Stats, Tier } from "./types";

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
  if (p.pet) {
    hp += p.pet.bonusStats.hp;
    str += p.pet.bonusStats.str;
    agl += p.pet.bonusStats.agl;
    spd += p.pet.bonusStats.spd;
  }
  return { hp, str, agl, spd };
}

export function petCombatStats(p: Player): Stats | null {
  if (!p.pet) return null;
  const s = p.pet.bonusStats;
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

  const petTpl = PET_LIBRARY[Math.floor(r() * PET_LIBRARY.length)];
  const pet = r() > 0.15 ? { ...petTpl, level: Math.max(1, level - Math.floor(r() * 5)) } : null;

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
    pet,
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
  const s1 = totalStats(p1);
  const s2 = totalStats(p2);
  const pet1 = petCombatStats(p1);
  const pet2 = petCombatStats(p2);

  let hp1 = s1.hp;
  let hp2 = s2.hp;
  let petHp1 = pet1 ? pet1.hp : 0;
  let petHp2 = pet2 ? pet2.hp : 0;

  const events: BattleEvent[] = [];
  events.push({
    t: "start",
    attacker: "p1",
    target: "p2",
    hp1After: hp1,
    hp2After: hp2,
    msg: "Battle begin",
  });

  const order: ("p1" | "p2" | "pet1" | "pet2")[] = [];
  const combatants: { who: "p1" | "p2" | "pet1" | "pet2"; spd: number }[] = [
    { who: "p1", spd: s1.spd },
    { who: "p2", spd: s2.spd },
  ];
  if (pet1) combatants.push({ who: "pet1", spd: pet1.spd });
  if (pet2) combatants.push({ who: "pet2", spd: pet2.spd });
  combatants.sort((a, b) => b.spd - a.spd);
  for (const c of combatants) order.push(c.who);

  let round = 0;
  const maxRounds = 60;

  while (hp1 > 0 && hp2 > 0 && round < maxRounds) {
    round++;
    for (const who of order) {
      if (hp1 <= 0 || hp2 <= 0) break;

      let attackerStats: Stats;
      let defenderStats: Stats;
      let target: "p1" | "p2";
      let attackerLabel: typeof who = who;

      if (who === "p1") {
        if (hp1 <= 0) continue;
        attackerStats = s1; defenderStats = s2; target = "p2";
      } else if (who === "p2") {
        if (hp2 <= 0) continue;
        attackerStats = s2; defenderStats = s1; target = "p1";
      } else if (who === "pet1") {
        if (!pet1 || petHp1 <= 0) continue;
        attackerStats = pet1; defenderStats = s2; target = "p2";
      } else {
        if (!pet2 || petHp2 <= 0) continue;
        attackerStats = pet2; defenderStats = s1; target = "p1";
      }

      const dodgeChance = Math.min(0.4, defenderStats.agl / (defenderStats.agl + attackerStats.agl * 1.6 + 50));
      if (r() < dodgeChance) {
        events.push({
          t: "dodge",
          attacker: attackerLabel,
          target,
          hp1After: hp1,
          hp2After: hp2,
        });
        continue;
      }

      const mitigation = defenderStats.agl / (defenderStats.agl + attackerStats.str * 1.2 + 80);
      const variance = 0.85 + r() * 0.30;
      const baseDamage = attackerStats.str * (1 - mitigation) * variance;
      const critChance = Math.min(0.30, 0.05 + Math.max(0, attackerStats.spd - defenderStats.spd) / (defenderStats.spd + 200));
      const isCrit = r() < critChance;
      const damage = Math.max(1, Math.round(baseDamage * (isCrit ? 1.7 : 1)));

      if (target === "p1") hp1 = Math.max(0, hp1 - damage);
      else hp2 = Math.max(0, hp2 - damage);

      events.push({
        t: isCrit ? "crit" : (who === "pet1" || who === "pet2" ? "pet_attack" : "attack"),
        attacker: attackerLabel,
        target,
        damage,
        hp1After: hp1,
        hp2After: hp2,
      });
    }
  }

  const winner: "p1" | "p2" = hp1 > hp2 ? "p1" : "p2";
  events.push({ t: "end", attacker: winner, target: winner === "p1" ? "p2" : "p1", hp1After: hp1, hp2After: hp2 });

  return { events, winner, rounds: round };
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
