import { describe, expect, it } from "vitest";
import { createWorkerRoute, getBuildingHeight, getWorldLayout, getWorldMode, getWorldProjection, PHASE_DURATION_MS, projectWorldPoint } from "./worldLayout";

describe("world layout", () => {
  it.each(["wide", "narrow"] as const)("keeps every site inside the %s artboard", (mode) => {
    const layout = getWorldLayout(mode);
    Object.values(layout.sites).forEach(({ x, y }) => {
      expect(x).toBeGreaterThanOrEqual(0.05);
      expect(x).toBeLessThanOrEqual(0.95);
      expect(y).toBeGreaterThanOrEqual(0.25);
      expect(y).toBeLessThanOrEqual(0.88);
    });
    expect(layout.hudClearance).toBeGreaterThan(0.08);
  });

  it("places wide controls beside their landmarks on readable terrain", () => {
    const controls = getWorldLayout("wide").controls;
    expect(controls.farm).toEqual({ x: 0.32, y: 0.9 });
    expect(controls.lumberCamp).toEqual({ x: 0.38, y: 0.64 });
    expect(controls.town).toEqual({ x: 0.55, y: 0.82 });
    expect(controls.quarry).toEqual({ x: 0.76, y: 0.82 });
    expect(controls.castle).toEqual({ x: 0.73, y: 0.44 });
    expect(getWorldLayout("wide").buildControls.quarry).toEqual({ x: 0.76, y: 0.72 });
    expect(getWorldLayout("wide").buildControls.castle).toEqual({ x: 0.73, y: 0.42 });
  });

  it("uses one shared breakpoint for DOM and Phaser layouts", () => {
    expect(getWorldMode(679)).toBe("narrow");
    expect(getWorldMode(680)).toBe("wide");
  });

  it.each(["wide", "narrow"] as const)("keeps every %s hit footprint on its artwork", (mode) => {
    Object.values(getWorldLayout(mode).hitAreas).forEach(({ center, width, height }) => {
      expect(center.x - width / 2).toBeGreaterThanOrEqual(0);
      expect(center.x + width / 2).toBeLessThanOrEqual(1);
      expect(center.y - height / 2).toBeGreaterThanOrEqual(0);
      expect(center.y + height / 2).toBeLessThanOrEqual(1);
    });
  });

  it("covers most of the wide Farm and centers Lumber Camp interaction", () => {
    const { hitAreas, sites } = getWorldLayout("wide");
    expect(hitAreas.farm).toEqual({ center: sites.farm, width: 0.22, height: 0.16 });
    expect(hitAreas.lumberCamp.center).toEqual(sites.lumberCamp);
  });

  it("keeps narrow controls close to their landmarks", () => {
    const layout = getWorldLayout("narrow");
    Object.keys(layout.sites).forEach((name) => {
      const site = layout.sites[name as keyof typeof layout.sites];
      const control = layout.controls[name as keyof typeof layout.controls];
      expect(Math.abs(control.x - site.x)).toBeLessThanOrEqual(name === "quarry" ? 0.1 : 0.031);
      expect(Math.abs(control.y - site.y)).toBeLessThanOrEqual(0.13);
    });
  });

  it.each(["wide", "narrow"] as const)("provides multi-leg routes between the %s town and workplaces", (mode) => {
    const layout = getWorldLayout(mode);
    (["farm", "lumberCamp", "quarry"] as const).forEach((location) => {
      expect(layout.routes[location].length).toBeGreaterThanOrEqual(3);
      expect(layout.routes[location][0]).toEqual(layout.townDoor);
      expect(layout.routes[location].at(-1)).toEqual(layout.workPoints[location]);
    });
    expect(new Set(layout.wanderPoints.map(({ x, y }) => `${x},${y}`)).size).toBeGreaterThanOrEqual(5);
  });

  it("projects points against the approved 3840 by 1917 wide artwork", () => {
    const projection = getWorldProjection({ width: 1200, height: 1000 }, "wide");
    expect(projection.width).toBeGreaterThanOrEqual(1200);
    expect(projection.height).toBeGreaterThanOrEqual(1000);
    expect(projection.y + projection.height).toBeCloseTo(1000, 5);
    expect(projection.y).toBeLessThanOrEqual(0);
    expect(projection.mapY).toBeCloseTo(0, 5);
    expect(projection.mapHeight).toBeCloseTo(1000, 5);
    expect(projectWorldPoint({ x: 0.55, y: 0.5 }, { width: 1200, height: 1000 }, "wide").x).toBeCloseTo(600, 5);
    const tall = projectWorldPoint({ x: 1, y: 1 }, { width: 1200, height: 1000 }, "wide");
    const origin = projectWorldPoint({ x: 0, y: 0 }, { width: 1200, height: 1000 }, "wide");
    expect((tall.x - origin.x) / (tall.y - origin.y)).toBeCloseTo(3840 / 1917, 5);
    expect(tall.y).toBeCloseTo(1000, 0);
    expect(origin.y).toBeCloseTo(0, 0);

    const ultrawideProjection = getWorldProjection({ width: 2560, height: 1080 }, "wide");
    expect(ultrawideProjection.width).toBeGreaterThanOrEqual(2560);
    expect(ultrawideProjection.height).toBeGreaterThanOrEqual(1080);
    expect(ultrawideProjection.y + ultrawideProjection.height).toBeCloseTo(1080, 5);
  });

  it("covers a mobile viewport without exposing shell-colored margins", () => {
    const projection = getWorldProjection({ width: 390, height: 844 }, "narrow");
    expect(projection.width).toBeGreaterThanOrEqual(390);
    expect(projection.height).toBeGreaterThanOrEqual(844);
    expect(projection.x).toBeLessThanOrEqual(0);
    expect(projection.x + projection.width).toBeGreaterThanOrEqual(390);
    expect(projection.y + projection.height).toBeCloseTo(844, 5);
  });

  it("gives coworkers separate lanes and work positions", () => {
    const layout = getWorldLayout("wide");
    const routes = [0, 1, 2, 3].map((index) => createWorkerRoute(layout, "farm", index, "toWork"));
    expect(new Set(routes.map((route) => `${route[1].x},${route[1].y}`)).size).toBe(4);
    expect(new Set(routes.map((route) => `${route.at(-1)?.x},${route.at(-1)?.y}`)).size).toBe(4);
  });

  it("holds each day and night phase for five minutes", () => {
    expect(PHASE_DURATION_MS).toBe(300_000);
  });

  it("sizes the quarry to cover the mountain opening", () => {
    expect(getBuildingHeight("quarry", "wide")).toBe(0.1485);
  });

  it("anchors the castle entrance at the end of the hill road", () => {
    expect(getWorldLayout("wide").sites.castle).toEqual({ x: 0.73, y: 0.52 });
    expect(getWorldLayout("narrow").sites.castle.y).toBeGreaterThanOrEqual(0.38);
  });

  it("lowers the quarry entrance toward its road", () => {
    expect(getWorldLayout("wide").sites.quarry).toEqual({ x: 0.76, y: 0.76 });
    expect(getWorldLayout("narrow").sites.quarry).toEqual({ x: 0.808, y: 0.692 });
  });

  it("keeps foreground buildings small enough for the world to feel expansive", () => {
    expect(getBuildingHeight("farm", "wide")).toBeCloseTo(0.2593, 4);
    expect(getBuildingHeight("lumberCamp", "wide")).toBeCloseTo(0.2435, 4);
    expect(getBuildingHeight("town", "wide")).toBeCloseTo(0.2435, 4);
    expect(getBuildingHeight("castle", "wide")).toBeCloseTo(0.3125, 4);
    expect(getBuildingHeight("quarry", "wide")).toBeCloseTo(0.1485, 4);
  });

  it("moves the farm down and castle right within their plots", () => {
    const sites = getWorldLayout("wide").sites;
    expect(sites.farm).toEqual({ x: 0.32, y: 0.81 });
    expect(sites.castle).toEqual({ x: 0.73, y: 0.52 });
  });

  it("moves the narrow castle controls with the castle", () => {
    const layout = getWorldLayout("narrow");
    expect(layout.controls.castle).toEqual({ x: 0.73, y: 0.44 });
    expect(layout.buildControls.castle).toEqual({ x: 0.73, y: 0.46 });
  });

  it("places built Lumber Camp controls slightly below its build prompt", () => {
    const layout = getWorldLayout("wide");
    expect(layout.buildControls.lumberCamp).toEqual({ x: 0.38, y: 0.625 });
    expect(layout.controls.lumberCamp).toEqual({ x: 0.38, y: 0.64 });
  });
});
