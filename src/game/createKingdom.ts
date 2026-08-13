import type { GameState, WorkLocation } from "./model";

export interface KingdomController {
  updateState(state: GameState): void;
  emitResourceGain(location: Exclude<WorkLocation, "idle">, amount: number): void;
  destroy(): void;
}

export const createKingdom = async (
  mount: HTMLElement,
  options: { getState: () => GameState; onGather: (location: Exclude<WorkLocation, "idle">) => void; onPhase: (phase: string) => void; onWorkStatus: (working: boolean) => void; reducedMotion: boolean },
): Promise<KingdomController> => {
  const [{ default: Phaser }, { KingdomScene }] = await Promise.all([import("phaser"), import("./KingdomScene")]);
  const scene = new KingdomScene(options);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: mount,
    width: mount.clientWidth,
    height: mount.clientHeight,
    transparent: true,
    pixelArt: true,
    antialias: false,
    scene,
    scale: { mode: Phaser.Scale.RESIZE, width: mount.clientWidth, height: mount.clientHeight },
    render: { pixelArt: true, antialias: false, roundPixels: true },
  });
  const resizeObserver = new ResizeObserver(() => game.scale.resize(mount.clientWidth, mount.clientHeight));
  resizeObserver.observe(mount);
  return {
    updateState: (state) => scene.syncState(state),
    emitResourceGain: (location, amount) => scene.emitResourceGain(location, amount),
    destroy: () => { resizeObserver.disconnect(); game.destroy(true); },
  };
};
