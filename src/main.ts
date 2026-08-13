import "./styles.css";
import { advanceGame, BUILD_COSTS, createInitialState, getProductionRates, getRecruitCost, MAX_VILLAGERS, reduceGame, type BuildLocation, type GameAction, type GameState, type WorkLocation } from "./game/model";
import { createKingdom, type KingdomController } from "./game/createKingdom";
import { loadGame, resetGame, saveGame } from "./game/storage";
import { getWorldLayout, projectWorldPoint, type SiteName } from "./game/worldLayout";

const $ = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing required element: ${selector}`);
  return element;
};

const controls = $("#controls");
const status = $("#status");
const values = {
  food: $("#food"), wood: $("#wood"), stone: $("#stone"), population: $("#population"),
  phase: $("#phase"), phaseIcon: $("#phase-icon"),
};
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let state: GameState = loadGame(localStorage);
let kingdom: KingdomController | undefined;
let workersAtWork = true;

const positioned = (name: SiteName, build = false) => {
  const mode = matchMedia("(max-width: 680px)").matches ? "narrow" : "wide";
  const layout = getWorldLayout(mode);
  const point = build && name !== "farm" ? layout.buildControls[name] : layout.controls[name];
  const screen = projectWorldPoint(point, { width: innerWidth, height: innerHeight }, mode);
  return `style="left:${screen.x}px;top:${screen.y}px"`;
};

const format = (value: number) => Math.floor(value).toLocaleString();
const assigned = (location: Exclude<WorkLocation, "idle">) => state.villagers.filter((villager) => villager.assignment === location).length;
const idleCount = () => state.villagers.filter((villager) => villager.assignment === "idle").length;
const affordable = (location: BuildLocation) => Object.entries(BUILD_COSTS[location]).every(([resource, amount]) => state.resources[resource as keyof GameState["resources"]] >= amount);
const requirementText = (location: BuildLocation) => Object.entries(BUILD_COSTS[location]).filter(([, amount]) => amount > 0).map(([resource, amount]) => `${format(amount)} ${resource}`).join(" · ");

const setState = (next: GameState, announcement?: string) => {
  state = next;
  state.lastUpdatedAt = Date.now();
  saveGame(localStorage, state);
  render();
  kingdom?.updateState(state);
  if (announcement) status.textContent = announcement;
};

const act = (action: GameAction, announcement?: string) => setState(reduceGame(state, action), announcement);

const workerControl = (location: Exclude<WorkLocation, "idle">, label: string) => `
  <div class="site-control site-${location}" ${positioned(location)}>
    <strong>${label}</strong>
    <div class="worker-row">
      <button data-assign="${location}" data-amount="-1" ${assigned(location) === 0 ? "disabled" : ""} aria-label="Remove a worker from ${label}">−</button>
      <span>${assigned(location)} worker${assigned(location) === 1 ? "" : "s"}</span>
      <button data-assign="${location}" data-amount="1" ${idleCount() === 0 ? "disabled" : ""} aria-label="Assign a worker to ${label}">+</button>
    </div>
  </div>`;

const buildControl = (location: BuildLocation, label: string) => `
  <div class="site-control site-${location} build-control" ${positioned(location, true)}>
    <strong>${label}</strong><small>${requirementText(location)}</small>
    ${affordable(location) ? `<button data-build="${location}">Build</button>` : ""}
  </div>`;

const render = () => {
  values.food.textContent = format(state.resources.food);
  values.wood.textContent = format(state.resources.wood);
  values.stone.textContent = format(state.resources.stone);
  values.population.textContent = `${state.villagers.length} (${idleCount()} idle)`;
  const progression: Array<[BuildLocation, string]> = [
    ["lumberCamp", "Lumber Camp"], ["town", "Town"], ["quarry", "Quarry"], ["castle", "Castle"],
  ];
  const nextLocked = progression.find(([location]) => !state.unlocked[location]);
  controls.innerHTML = [
    workerControl("farm", "Farm"),
    state.unlocked.lumberCamp ? workerControl("lumberCamp", "Lumber Camp") : nextLocked?.[0] === "lumberCamp" ? buildControl(...nextLocked) : "",
    state.unlocked.town ? `<div class="site-control site-town" ${positioned("town")}><strong>Town</strong>${state.villagers.length >= MAX_VILLAGERS
      ? `<span class="town-full">Town is full · ${MAX_VILLAGERS}/${MAX_VILLAGERS}</span>`
      : `<button data-recruit="true" ${state.resources.food < getRecruitCost(state) ? "disabled" : ""}>Recruit · ${getRecruitCost(state)} food</button>`}</div>` : nextLocked?.[0] === "town" ? buildControl(...nextLocked) : "",
    state.unlocked.quarry ? workerControl("quarry", "Quarry") : nextLocked?.[0] === "quarry" ? buildControl(...nextLocked) : "",
    state.unlocked.castle ? `<div class="site-control site-castle" ${positioned("castle")}><strong>Castle complete</strong><small>Your tiny kingdom prospers.</small></div>` : nextLocked?.[0] === "castle" ? buildControl(...nextLocked) : "",
  ].join("");
};

controls.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button");
  if (!button) return;
  if (button.dataset.build) act({ type: "build", location: button.dataset.build as BuildLocation }, `${button.dataset.build} built`);
  if (button.dataset.recruit) act({ type: "recruit" }, "A new villager joined the kingdom");
  if (button.dataset.assign) act({ type: "assign", location: button.dataset.assign as WorkLocation, amount: Number(button.dataset.amount) as 1 | -1 });
});

$(".portrait").addEventListener("click", (event) => (event.currentTarget as HTMLElement).classList.toggle("spin"));
$("#reset").addEventListener("click", () => {
  if (!confirm("Reset the kingdom and begin again?")) return;
  resetGame(localStorage);
  setState(createInitialState(), "Kingdom reset");
});

const gather = (location: Exclude<WorkLocation, "idle">) => {
  const before = state.resources;
  const next = reduceGame(state, { type: "gather", location });
  if (next === state) return;
  const resource = location === "farm" ? "food" : location === "lumberCamp" ? "wood" : "stone";
  kingdom?.emitResourceGain(location, next.resources[resource] - before[resource]);
  setState(next, `Gathered 1 ${resource}`);
};

render();
let resizeRenderTimer = 0;
addEventListener("resize", () => {
  window.clearTimeout(resizeRenderTimer);
  resizeRenderTimer = window.setTimeout(render, 80);
});
createKingdom($("#game"), {
  getState: () => state,
  onGather: gather,
  reducedMotion,
  onPhase: (phase) => {
    values.phase.textContent = phase;
    values.phaseIcon.textContent = phase === "Night" ? "🌙" : "☀️";
    workersAtWork = false;
  },
  onWorkStatus: (working) => { workersAtWork = working; },
}).then((controller) => { kingdom = controller; controller.updateState(state); }).catch((error) => {
  console.error(error);
  status.textContent = "The kingdom could not start, but Brandon's profile is still available.";
  document.body.classList.add("game-failed");
});

let lastTick = Date.now();
setInterval(() => {
  const now = Date.now();
  const elapsed = now - lastTick;
  lastTick = now;
  const rates = workersAtWork ? getProductionRates(state) : { food: 0, wood: 0, stone: 0 };
  state = advanceGame(state, elapsed, workersAtWork);
  state.lastUpdatedAt = now;
  render();
  kingdom?.updateState(state);
  (Object.entries(rates) as [keyof typeof rates, number][]).forEach(([resource, rate]) => {
    if (rate <= 0) return;
    const location = resource === "food" ? "farm" : resource === "wood" ? "lumberCamp" : "quarry";
    kingdom?.emitResourceGain(location, Math.max(1, Math.round(rate)));
  });
}, 1000);
setInterval(() => saveGame(localStorage, state), 5000);
addEventListener("pagehide", () => saveGame(localStorage, state));
