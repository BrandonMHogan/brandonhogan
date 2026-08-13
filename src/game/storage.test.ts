import { describe, expect, it } from "vitest";
import { createInitialState } from "./model";
import { loadGame, resetGame, saveGame, SAVE_KEY, type StorageLike } from "./storage";

const memoryStorage = (): StorageLike & { has(key: string): boolean } => {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    has: (key) => values.has(key),
  };
};

describe("game storage", () => {
  it("round trips a valid save", () => {
    const storage = memoryStorage();
    const state = createInitialState(100);
    state.resources.food = 42;
    saveGame(storage, state);
    expect(loadGame(storage, 200).resources.food).toBe(42);
  });

  it("falls back safely when persisted data is invalid", () => {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, "not-json");
    expect(loadGame(storage, 200)).toEqual(createInitialState(200));
  });

  it("removes only the namespaced game save", () => {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, "save");
    storage.setItem("unrelated", "keep");
    resetGame(storage);
    expect(storage.has(SAVE_KEY)).toBe(false);
    expect(storage.has("unrelated")).toBe(true);
  });
});
