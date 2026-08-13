import type { BuildLocation } from "./model";

export type Point = { x: number; y: number };
export type SiteName = "farm" | BuildLocation;
export type WorkSite = "farm" | "lumberCamp" | "quarry";
export type Viewport = { width: number; height: number };
export type WorldMode = "wide" | "narrow";

export const PHASE_DURATION_MS = 300_000;
const MAP_SIZE: Record<WorldMode, Viewport> = {
  wide: { width: 1672, height: 941 },
  narrow: { width: 941, height: 1672 },
};
const EXTENDED_ART_HEIGHT: Record<WorldMode, number> = {
  wide: 1400,
  narrow: 2072,
};

export const getWorldProjection = (viewport: Viewport, mode: WorldMode) => {
  const map = MAP_SIZE[mode];
  const scale = viewport.width / map.width;
  const width = map.width * scale;
  const height = EXTENDED_ART_HEIGHT[mode] * scale;
  const y = viewport.height - height;
  const mapHeight = map.height * scale;
  const mapY = y + (EXTENDED_ART_HEIGHT[mode] - map.height) * scale;
  return { x: (viewport.width - width) / 2, y, width, height, scale, mapY, mapHeight };
};

export const projectWorldPoint = (point: Point, viewport: Viewport, mode: WorldMode): Point => {
  const projection = getWorldProjection(viewport, mode);
  return { x: projection.x + point.x * projection.width, y: projection.mapY + point.y * projection.mapHeight };
};

export interface WorldLayout {
  sites: Record<SiteName, Point>;
  controls: Record<SiteName, Point>;
  buildControls: Record<BuildLocation, Point>;
  workPoints: Record<WorkSite, Point>;
  routes: Record<WorkSite, Point[]>;
  wanderPoints: Point[];
  townDoor: Point;
  hudClearance: number;
}

const BUILDING_HEIGHTS: Record<SiteName, number> = {
  farm: .2593, lumberCamp: .2435, town: .2435, quarry: .1485, castle: .3125,
};

export const getBuildingHeight = (name: SiteName, mode: WorldMode): number =>
  BUILDING_HEIGHTS[name] * (mode === "narrow" ? .78 : 1);

const wide = (): WorldLayout => {
  const townDoor = { x: 0.5, y: 0.66 };
  const workPoints = {
    farm: { x: 0.235, y: 0.735 },
    lumberCamp: { x: 0.155, y: 0.49 },
    quarry: { x: 0.84, y: 0.61 },
  };
  return {
    sites: {
      farm: { x: 0.14, y: 0.746 }, lumberCamp: { x: 0.2, y: 0.48 },
      town: { x: 0.5, y: 0.595 }, quarry: { x: 0.863, y: 0.65 }, castle: { x: 0.82, y: 0.37 },
    },
    controls: {
      farm: { x: 0.14, y: 0.84 }, lumberCamp: { x: 0.2, y: 0.555 },
      town: { x: 0.5, y: 0.72 }, quarry: { x: 0.755, y: 0.66 }, castle: { x: 0.82, y: 0.46 },
    },
    buildControls: {
      lumberCamp: { x: 0.2, y: 0.47 }, town: { x: 0.5, y: 0.56 },
      quarry: { x: 0.755, y: 0.61 }, castle: { x: 0.82, y: 0.26 },
    },
    workPoints,
    routes: {
      farm: [townDoor, { x: 0.46, y: 0.68 }, { x: 0.34, y: 0.69 }, workPoints.farm],
      lumberCamp: [townDoor, { x: 0.45, y: 0.61 }, { x: 0.34, y: 0.54 }, workPoints.lumberCamp],
      quarry: [townDoor, { x: 0.61, y: 0.66 }, { x: 0.72, y: 0.64 }, workPoints.quarry],
    },
    wanderPoints: [
      { x: .43, y: .66 }, { x: .48, y: .71 }, { x: .56, y: .69 }, { x: .61, y: .64 },
      { x: .57, y: .59 }, { x: .49, y: .61 }, { x: .38, y: .62 },
    ],
    townDoor, hudClearance: 0.12,
  };
};

const narrow = (): WorldLayout => {
  const townDoor = { x: 0.5, y: 0.595 };
  const workPoints = {
    farm: { x: 0.28, y: 0.72 },
    lumberCamp: { x: 0.14, y: 0.42 },
    quarry: { x: 0.83, y: 0.7 },
  };
  return {
    sites: {
      farm: { x: 0.17, y: 0.716 }, lumberCamp: { x: 0.2, y: 0.4 },
      town: { x: 0.5, y: 0.54 }, quarry: { x: 0.808, y: 0.692 }, castle: { x: 0.73, y: 0.39 },
    },
    controls: {
      farm: { x: 0.17, y: 0.8 }, lumberCamp: { x: 0.2, y: 0.475 },
      town: { x: 0.5, y: 0.63 }, quarry: { x: 0.71, y: 0.72 }, castle: { x: 0.73, y: 0.44 },
    },
    buildControls: {
      lumberCamp: { x: 0.2, y: 0.38 }, town: { x: 0.5, y: 0.52 },
      quarry: { x: 0.71, y: 0.68 }, castle: { x: 0.73, y: 0.31 },
    },
    workPoints,
    routes: {
      farm: [townDoor, { x: .45, y: .64 }, { x: .36, y: .69 }, workPoints.farm],
      lumberCamp: [townDoor, { x: .43, y: .55 }, { x: .31, y: .48 }, workPoints.lumberCamp],
      quarry: [townDoor, { x: .59, y: .62 }, { x: .7, y: .67 }, workPoints.quarry],
    },
    wanderPoints: [
      { x: .4, y: .59 }, { x: .45, y: .65 }, { x: .53, y: .66 }, { x: .61, y: .62 },
      { x: .57, y: .56 }, { x: .48, y: .57 }, { x: .36, y: .55 },
    ],
    townDoor, hudClearance: 0.13,
  };
};

export const getWorldLayout = (mode: "wide" | "narrow"): WorldLayout => mode === "wide" ? wide() : narrow();

export const createWorkerRoute = (
  layout: WorldLayout,
  location: WorkSite,
  coworkerIndex: number,
  direction: "toWork" | "toTown",
): Point[] => {
  const lane = ((coworkerIndex % 5) - 2) * 0.008;
  const workColumn = coworkerIndex % 3;
  const workRow = Math.floor(coworkerIndex / 3) % 3;
  const route = layout.routes[location].map((point, index, points) => {
    if (index === 0) return { x: point.x + lane * .25, y: point.y };
    if (index === points.length - 1) {
      return { x: point.x + (workColumn - 1) * .018, y: point.y + (workRow - 1) * .014 };
    }
    return { x: point.x + lane, y: point.y + lane * (index % 2 === 0 ? -.55 : .55) };
  });
  return direction === "toTown" ? route.reverse() : route;
};
