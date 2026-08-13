import { describe, expect, it } from "vitest";
import { createWorkerRoute, getBuildingHeight, getWorldLayout, getWorldProjection, PHASE_DURATION_MS, projectWorldPoint } from "./worldLayout";

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
    expect(controls.farm).toEqual({ x: 0.14, y: 0.84 });
    expect(controls.lumberCamp).toEqual({ x: 0.2, y: 0.555 });
    expect(controls.town).toEqual({ x: 0.5, y: 0.72 });
    expect(controls.quarry).toEqual({ x: 0.755, y: 0.66 });
    expect(controls.castle).toEqual({ x: 0.82, y: 0.46 });
    expect(getWorldLayout("wide").buildControls.quarry).toEqual({ x: 0.755, y: 0.61 });
    expect(getWorldLayout("wide").buildControls.castle).toEqual({ x: 0.82, y: 0.26 });
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

  it("projects points against the unchanged lower map inside the extended artwork", () => {
    const projection = getWorldProjection({ width: 1200, height: 1000 }, "wide");
    expect(projection.height).toBeCloseTo(1004.78, 2);
    expect(projection.mapY).toBeCloseTo(324.64, 2);
    expect(projection.mapHeight).toBeCloseTo(675.36, 2);
    const tall = projectWorldPoint({ x: 1, y: 1 }, { width: 1200, height: 1000 }, "wide");
    const origin = projectWorldPoint({ x: 0, y: 0 }, { width: 1200, height: 1000 }, "wide");
    expect((tall.x - origin.x) / (tall.y - origin.y)).toBeCloseTo(1672 / 941, 5);
    expect(tall.y).toBe(1000);
    expect(origin.y).toBeCloseTo(324.64, 1);

    const ultrawide = projectWorldPoint({ x: 1, y: 1 }, { width: 2560, height: 1080 }, "wide");
    expect(ultrawide.y).toBe(1080);
    expect(ultrawide.x).toBe(2560);
    expect(projectWorldPoint({ x: 0, y: 0 }, { width: 2560, height: 1080 }, "wide").y).toBeCloseTo(-360.8, 1);
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
    expect(getWorldLayout("wide").sites.castle).toEqual({ x: 0.82, y: 0.37 });
    expect(getWorldLayout("narrow").sites.castle.y).toBeGreaterThanOrEqual(0.38);
  });

  it("lowers the quarry entrance toward its road", () => {
    expect(getWorldLayout("wide").sites.quarry).toEqual({ x: 0.863, y: 0.65 });
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
    expect(sites.farm).toEqual({ x: 0.14, y: 0.746 });
    expect(sites.castle).toEqual({ x: 0.82, y: 0.37 });
  });

  it("moves the narrow castle controls with the castle", () => {
    const layout = getWorldLayout("narrow");
    expect(layout.controls.castle).toEqual({ x: 0.73, y: 0.44 });
    expect(layout.buildControls.castle).toEqual({ x: 0.73, y: 0.31 });
  });
});
