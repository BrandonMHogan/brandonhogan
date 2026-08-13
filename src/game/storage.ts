import { advanceGame, createInitialState, type GameState } from "./model";

export const SAVE_KEY = "brandonhogan.kingdom.v1";
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const isGameState = (value: unknown): value is GameState => {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<GameState>;
  return state.version === 1 && typeof state.lastUpdatedAt === "number" && Array.isArray(state.villagers) &&
    Boolean(state.resources && state.unlocked);
};

export const loadGame = (storage: StorageLike, now = Date.now()): GameState => {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return createInitialState(now);
    const parsed: unknown = JSON.parse(raw);
    if (!isGameState(parsed)) return createInitialState(now);
    return advanceGame(parsed, now - parsed.lastUpdatedAt);
  } catch {
    return createInitialState(now);
  }
};

export const saveGame = (storage: StorageLike, state: GameState): void => {
  storage.setItem(SAVE_KEY, JSON.stringify(state));
};

export const resetGame = (storage: StorageLike): void => storage.removeItem(SAVE_KEY);
