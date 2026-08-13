import type { Point } from "./worldLayout";

export const getCelestialPosition = (progress: number, width: number, height: number): Point => {
  const t = Math.max(0, Math.min(1, progress));
  const horizon = height * .45;
  const arcHeight = height * .33;
  return {
    x: -width * .06 + width * 1.12 * t,
    y: horizon - Math.sin(Math.PI * t) * arcHeight,
  };
};
