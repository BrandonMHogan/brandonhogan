import type { Point, WorldMode } from "./worldLayout";

export const getCelestialPosition = (progress: number, width: number, height: number, mode: WorldMode = "wide"): Point => {
  const t = Math.max(0, Math.min(1, progress));
  if (mode === "narrow") {
    const horizon = height * .14;
    const arcHeight = height * .08;
    return { x: width * .08 + width * .84 * t, y: horizon - Math.sin(Math.PI * t) * arcHeight };
  }
  const horizon = height * .45;
  const arcHeight = height * .33;
  return {
    x: -width * .06 + width * 1.12 * t,
    y: horizon - Math.sin(Math.PI * t) * arcHeight,
  };
};
