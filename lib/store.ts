import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { makeEquipment } from "./data";
import { generateOpponentList } from "./game";
import type { AvatarStyle, BattleEvent, Equipment, EquipSlot, Pet, Player, Tier } from "./types";

const NEW_PLAYER: Player = {
  id: "me",
  name: "Hero",
  level: 1,
  xp: 0,
  gold: 250,
  crystals: 0,
  wins: 0,
  losses: 0,
  avatarSeed: "hero-1",
  avatarStyle: "lorelei",
  equipment: {
    weapon: makeEquipment("weapon", 1 as Tier),
    helmet: null,
    chest: null,
    gloves: null,
    boots: null,
    accessory: null,
  },
  pet: null,
};

type LastBattle = {
  winner: "p1" | "p2";
  events: BattleEvent[];
  opponentName: string;
  opponentLevel: number;
} | null;

type State = {
  hydrated: boolean;
  player: Player;
  opponents: Player[];
  selectedOpponentId: string | null;
  lastBattle: LastBattle;
  setHydrated: () => void;
  setPlayer: (p: Player) => void;
  updatePlayer: (fn: (p: Player) => Player) => void;
  setName: (name: string) => void;
  setAvatar: (seed: string, style: AvatarStyle) => void;
  refreshOpponents: () => void;
  ensureOpponents: () => void;
  selectOpponent: (id: string | null) => void;
  setEquipment: (slot: EquipSlot, eq: Equipment | null) => void;
  setPet: (pet: Pet | null) => void;
  setLastBattle: (r: LastBattle) => void;
  reset: () => void;
};

export const useGame = create<State>()(
  persist(
    (set, get) => ({
      hydrated: false,
      player: NEW_PLAYER,
      opponents: [],
      selectedOpponentId: null,
      lastBattle: null,
      setHydrated: () => set({ hydrated: true }),
      setPlayer: (p) => set({ player: p }),
      updatePlayer: (fn) => set({ player: fn(get().player) }),
      setName: (name) => set({ player: { ...get().player, name } }),
      setAvatar: (seed, style) =>
        set({ player: { ...get().player, avatarSeed: seed, avatarStyle: style } }),
      refreshOpponents: () => {
        const list = generateOpponentList(get().player.level, 6, Math.random().toString(36));
        set({ opponents: list, selectedOpponentId: list[0]?.id ?? null });
      },
      ensureOpponents: () => {
        if (get().opponents.length === 0) {
          const list = generateOpponentList(get().player.level, 6, Math.random().toString(36));
          set({ opponents: list, selectedOpponentId: list[0]?.id ?? null });
        }
      },
      selectOpponent: (id) => set({ selectedOpponentId: id }),
      setEquipment: (slot, eq) =>
        set({
          player: {
            ...get().player,
            equipment: { ...get().player.equipment, [slot]: eq },
          },
        }),
      setPet: (pet) => set({ player: { ...get().player, pet } }),
      setLastBattle: (r) => set({ lastBattle: r }),
      reset: () =>
        set({
          player: {
            ...NEW_PLAYER,
            avatarSeed: `hero-${Math.random().toString(36).slice(2, 8)}`,
          },
          opponents: [],
          selectedOpponentId: null,
          lastBattle: null,
        }),
    }),
    {
      name: "afo-clone-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ player: s.player }) as unknown as State,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
