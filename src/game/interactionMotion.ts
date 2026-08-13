import type { GameState } from "./model";

export const PROGRESSION_CROSSFADE_MS = 900;
export const CONTROL_REVEAL_DELAY_MS = 550;
export const RESOURCE_POPUP_MS = 1400;

export const getProgressionStage = (state: GameState): number => {
  if (state.unlocked.castle) return 5;
  if (state.unlocked.quarry) return 4;
  if (state.unlocked.town) return 3;
  if (state.unlocked.lumberCamp) return 2;
  return state.farmRestored ? 1 : 0;
};
