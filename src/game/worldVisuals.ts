import type { WorldMode } from "./worldLayout";

export type WorldTextureKeys = { empty: string; completed: string };

export const getWorldTextureKeys = (mode: WorldMode): WorldTextureKeys => mode === "narrow"
  ? { empty: "world-mobile-empty", completed: "world-mobile-castle" }
  : { empty: "world-empty", completed: "world-castle" };
