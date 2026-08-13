export type Resource = "food" | "wood" | "stone";
export type WorkLocation = "idle" | "farm" | "lumberCamp" | "quarry";
export type BuildLocation = "lumberCamp" | "town" | "quarry" | "castle";

export interface Villager {
  id: string;
  assignment: WorkLocation;
}

export interface GameState {
  version: 2;
  farmRestored: boolean;
  resources: Record<Resource, number>;
  unlocked: { farm: true; lumberCamp: boolean; town: boolean; quarry: boolean; castle: boolean };
  villagers: Villager[];
  lastUpdatedAt: number;
}

export type GameAction =
  | { type: "gather"; location: Exclude<WorkLocation, "idle"> }
  | { type: "build"; location: BuildLocation }
  | { type: "recruit" }
  | { type: "assign"; location: WorkLocation; amount: 1 | -1 };

export const BUILD_COSTS = {
  lumberCamp: { food: 15, wood: 0, stone: 0 },
  town: { food: 35, wood: 30, stone: 0 },
  quarry: { food: 60, wood: 70, stone: 0 },
  castle: { food: 160, wood: 140, stone: 100 },
} as const;

export const BASE_RECRUIT_COST = 25;
export const RECRUIT_COST_STEP = 10;
export const MAX_VILLAGERS = 10;
export const MAX_OFFLINE_MS = 30 * 60 * 1000;
const RATES: Record<Exclude<WorkLocation, "idle">, { resource: Resource; perSecond: number }> = {
  farm: { resource: "food", perSecond: 0.65 },
  lumberCamp: { resource: "wood", perSecond: 0.48 },
  quarry: { resource: "stone", perSecond: 0.32 },
};

export const createInitialState = (now = Date.now()): GameState => ({
  version: 2,
  farmRestored: false,
  resources: { food: 0, wood: 0, stone: 0 },
  unlocked: { farm: true, lumberCamp: false, town: false, quarry: false, castle: false },
  villagers: [],
  lastUpdatedAt: now,
});

export const getProductionRates = (state: GameState): Record<Resource, number> => {
  const totals = { food: 0, wood: 0, stone: 0 };
  state.villagers.forEach(({ assignment }) => {
    if (assignment === "idle") return;
    const rate = RATES[assignment];
    totals[rate.resource] += rate.perSecond;
  });
  return totals;
};

export const getRecruitCost = (state: GameState): number => BASE_RECRUIT_COST + state.villagers.length * RECRUIT_COST_STEP;

const clone = (state: GameState): GameState => structuredClone(state);
const canAfford = (state: GameState, cost: Record<Resource, number>) =>
  (Object.keys(cost) as Resource[]).every((resource) => state.resources[resource] >= cost[resource]);

export const reduceGame = (state: GameState, action: GameAction): GameState => {
  const next = clone(state);
  if (action.type === "gather") {
    if (!next.unlocked[action.location]) return state;
    if (action.location === "farm" && !next.farmRestored) {
      next.farmRestored = true;
      return next;
    }
    const rate = RATES[action.location];
    next.resources[rate.resource] += 1;
    return next;
  }
  if (action.type === "build") {
    const cost = BUILD_COSTS[action.location];
    if (next.unlocked[action.location] || !canAfford(next, cost)) return state;
    (Object.keys(cost) as Resource[]).forEach((resource) => (next.resources[resource] -= cost[resource]));
    next.unlocked[action.location] = true;
    return next;
  }
  if (action.type === "recruit") {
    const cost = getRecruitCost(next);
    if (!next.unlocked.town || next.villagers.length >= MAX_VILLAGERS || next.resources.food < cost) return state;
    next.resources.food -= cost;
    next.villagers.push({ id: `villager-${crypto.randomUUID()}`, assignment: "idle" });
    return next;
  }
  const unlocked = action.location === "idle" || next.unlocked[action.location];
  if (!unlocked) return state;
  if (action.amount === 1) {
    const idle = next.villagers.find((villager) => villager.assignment === "idle");
    if (!idle || action.location === "idle") return state;
    idle.assignment = action.location;
  } else {
    const worker = next.villagers.find((villager) => villager.assignment === action.location);
    if (!worker || action.location === "idle") return state;
    worker.assignment = "idle";
  }
  return next;
};

export const advanceGame = (state: GameState, elapsedMs: number, productionEnabled = true): GameState => {
  const elapsed = Math.max(0, Math.min(elapsedMs, MAX_OFFLINE_MS));
  const next = clone(state);
  const rates = productionEnabled ? getProductionRates(next) : { food: 0, wood: 0, stone: 0 };
  (Object.keys(rates) as Resource[]).forEach((resource) => {
    next.resources[resource] += rates[resource] * (elapsed / 1000);
  });
  next.lastUpdatedAt += elapsed;
  return next;
};
