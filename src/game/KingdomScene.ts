import Phaser from "phaser";
import type { GameState, WorkLocation } from "./model";
import { createWorkerRoute, getBuildingHeight, getWorldLayout, getWorldProjection, PHASE_DURATION_MS, projectWorldPoint, type Point, type SiteName, type WorldMode, type WorkSite } from "./worldLayout";
import { getWideProgressionTextureKey, getWorldTextureKeys } from "./worldVisuals";
import { getCelestialPosition } from "./skyCycle";

interface SceneOptions {
  getState: () => GameState;
  onGather: (location: Exclude<WorkLocation, "idle">) => void;
  onPhase: (phase: string) => void;
  onWorkStatus: (working: boolean) => void;
  reducedMotion: boolean;
}

type VillagerView = { sprite: Phaser.GameObjects.Sprite; assignment: WorkLocation; variant: "man" | "woman"; moving: boolean; wanderStep: number; destination: "none" | "work" | "town"; departure?: Phaser.Time.TimerEvent };
type CloudView = { image: Phaser.GameObjects.Image; speed: number };

const BUILDING_TEXTURES: Record<SiteName, string> = {
  farm: "building-0", lumberCamp: "building-1", town: "building-2", quarry: "building-3-family", castle: "building-4-family",
};

const BUILDING_ORIGINS: Record<SiteName, { x: number; y: number }> = {
  farm: { x: .5, y: .76 }, lumberCamp: { x: .5, y: .76 }, town: { x: .5, y: .76 },
  quarry: { x: .5, y: .8 }, castle: { x: .5, y: .89 },
};

const modeForWidth = (width: number): WorldMode => width < 680 ? "narrow" : "wide";

export class KingdomScene extends Phaser.Scene {
  private options: SceneOptions;
  private currentState!: GameState;
  private buildings = new Map<SiteName, Phaser.GameObjects.Image>();
  private wideWorld?: Phaser.GameObjects.Image;
  private completedWorld?: Phaser.GameObjects.Image;
  private clouds: CloudView[] = [];
  private sun?: Phaser.GameObjects.Image;
  private moon?: Phaser.GameObjects.Image;
  private phaseStartedAt = 0;
  private villagers = new Map<string, VillagerView>();
  private nightOverlay?: Phaser.GameObjects.Rectangle;
  private stars?: Phaser.GameObjects.Container;
  private townGlow?: Phaser.GameObjects.Arc;
  private isNight = false;

  constructor(options: SceneOptions) {
    super("kingdom");
    this.options = options;
  }

  preload(): void {
    this.load.image("world-empty", "/assets/game/kingdom/world-empty-sky-clean.webp");
    this.load.image("world-castle", "/assets/game/kingdom/world-castle-sky-clean.webp");
    this.load.image("world-mobile-empty", "/assets/game/kingdom/world-mobile-empty-sky-clean.webp");
    this.load.image("world-mobile-castle", "/assets/game/kingdom/world-mobile-castle-sky-clean.webp");
    for (let index = 0; index < 6; index += 1) this.load.image(`cloud-${index}`, `/assets/game/kingdom/cloud-${index}.webp`);
    this.load.image("sun", "/assets/game/kingdom/sun.webp");
    this.load.image("moon", "/assets/game/kingdom/moon.webp");
    this.load.image("wide-farm-decrepit", "/assets/game/kingdom/wide-farm-decrepit-v1.webp");
    this.load.image("wide-through-farm", "/assets/game/kingdom/wide-through-farm-v1.webp");
    this.load.image("wide-through-lumber", "/assets/game/kingdom/wide-through-lumber-v1.webp");
    this.load.image("wide-through-town", "/assets/game/kingdom/wide-through-town-v3.webp");
    this.load.image("wide-through-quarry", "/assets/game/kingdom/wide-through-quarry-v1.webp");
    this.load.image("wide-full", "/assets/game/kingdom/wide-full-approved-v1.webp");
    for (let index = 0; index < 4; index += 1) this.load.image(`building-${index}`, `/assets/game/kingdom/building-${index}.webp`);
    this.load.image("building-3-family", "/assets/game/kingdom/building-3-family.webp");
    for (let index = 0; index < 16; index += 1) this.load.image(`villager-${index}`, `/assets/game/kingdom/villager-${String(index).padStart(2, "0")}.webp`);
    for (let index = 0; index < 16; index += 1) this.load.image(`villager-woman-${index}`, `/assets/game/kingdom/villager-woman-${String(index).padStart(2, "0")}.webp`);
  }

  create(): void {
    this.currentState = this.options.getState();
    this.phaseStartedAt = this.time.now;
    this.drawWorld();
    this.createAnimations();
    this.syncState(this.currentState);
    this.options.onWorkStatus(false);
    this.moveVillagers(true);
    this.time.addEvent({ delay: 2200, loop: true, callback: () => this.moveVillagers() });
    this.time.addEvent({ delay: PHASE_DURATION_MS, loop: true, callback: () => {
      this.isNight = !this.isNight;
      this.phaseStartedAt = this.time.now;
      this.setNight(this.isNight);
      this.moveVillagers(true);
    } });
  }

  syncState(state: GameState): void {
    this.currentState = state;
    if (!this.sys?.isActive()) return;
    this.wideWorld?.setTexture(getWideProgressionTextureKey(state));
    (["lumberCamp", "town", "quarry"] as const).forEach((name) => this.buildings.get(name)?.setVisible(state.unlocked[name]));
    if (this.completedWorld) this.tweens.add({ targets: this.completedWorld, alpha: state.unlocked.castle ? 1 : 0, duration: this.options.reducedMotion ? 0 : 550 });
    const ids = new Set(state.villagers.map(({ id }) => id));
    this.villagers.forEach(({ sprite }, id) => { if (!ids.has(id)) { sprite.destroy(); this.villagers.delete(id); } });
    state.villagers.forEach((villager, index) => {
      const existing = this.villagers.get(villager.id);
      if (existing) existing.assignment = villager.assignment;
      else {
        const variant = index % 2 === 0 ? "man" : "woman";
        this.villagers.set(villager.id, { sprite: this.createVillager(index, variant), assignment: villager.assignment, variant, moving: false, wanderStep: index, destination: "none" });
      }
    });
  }

  emitResourceGain(location: Exclude<WorkLocation, "idle">, amount: number): void {
    if (this.options.reducedMotion && amount < 2) return;
    const { width, height } = this.scale;
    const mode = modeForWidth(width);
    const point = projectWorldPoint(getWorldLayout(mode).sites[location], { width, height }, mode);
    const label = this.add.text(point.x, point.y - 52, `+${amount}`, {
      fontFamily: "Pixelify Sans, monospace", fontSize: "20px", color: "#fff2a6", stroke: "#352817", strokeThickness: 5,
    }).setOrigin(.5).setDepth(40);
    this.tweens.add({ targets: label, y: label.y - 40, alpha: 0, duration: 1050, ease: "Cubic.Out", onComplete: () => label.destroy() });
  }

  private drawWorld(): void {
    const { width, height } = this.scale;
    const mode = modeForWidth(width);
    const projection = getWorldProjection({ width, height }, mode);
    const worldTextures = getWorldTextureKeys(mode);
    if (mode === "wide") {
      this.wideWorld = this.add.image(projection.x + projection.width / 2, projection.y + projection.height / 2, getWideProgressionTextureKey(this.currentState))
        .setDisplaySize(projection.width, projection.height).setDepth(0);
    } else {
      this.add.image(width / 2, projection.y + projection.height / 2, worldTextures.empty).setDisplaySize(projection.width, projection.height).setDepth(0);
      this.completedWorld = this.add.image(width / 2, projection.y + projection.height / 2, worldTextures.completed)
        .setDisplaySize(projection.width, projection.height).setDepth(1).setAlpha(this.currentState.unlocked.castle ? 1 : 0);
    }
    this.drawSky();
    const layout = getWorldLayout(mode);
    (Object.keys(layout.sites) as SiteName[]).forEach((name) => {
      if (name === "castle") return;
      const point = projectWorldPoint(layout.sites[name], { width, height }, mode);
      const origin = BUILDING_ORIGINS[name];
      const image = this.add.image(point.x, point.y, BUILDING_TEXTURES[name]).setOrigin(origin.x, origin.y).setDepth(12);
      const targetHeight = projection.mapHeight * getBuildingHeight(name, mode);
      image.setScale(targetHeight / image.height);
      if (mode === "wide") image.setAlpha(.001);
      image.setVisible(name === "farm" || this.currentState.unlocked[name]);
      if (name === "farm" || name === "lumberCamp" || name === "quarry") {
        image.setInteractive({ useHandCursor: true, pixelPerfect: true, alphaTolerance: 20 }).on("pointerdown", () => this.options.onGather(name));
      }
      this.buildings.set(name, image);
    });
    this.stars = this.add.container(0, 0).setDepth(30).setAlpha(0);
    for (let index = 0; index < 34; index += 1) this.stars.add(this.add.rectangle((index * 83) % width, 18 + ((index * 47) % Math.max(40, height * .38)), index % 4 === 0 ? 2 : 1, index % 4 === 0 ? 2 : 1, 0xfff1bd));
    this.nightOverlay = this.add.rectangle(0, 0, width, height, 0x101b3d, 0).setOrigin(0).setDepth(25);
    const town = projectWorldPoint(layout.sites.town, { width, height }, mode);
    this.townGlow = this.add.circle(town.x, town.y - 10, projection.mapHeight * .1, 0xffb84d, 0).setDepth(26);
  }

  update(time: number, delta: number): void {
    const { width, height } = this.scale;
    if (!this.options.reducedMotion) this.clouds.forEach(({ image, speed }) => {
      image.x += speed * delta / 1000;
      if (image.x - image.displayWidth / 2 > width + 60) image.x = -image.displayWidth / 2 - 80;
    });
    const progress = this.options.reducedMotion ? .5 : (time - this.phaseStartedAt) / PHASE_DURATION_MS;
    const active = this.isNight ? this.moon : this.sun;
    const inactive = this.isNight ? this.sun : this.moon;
    if (active) {
      const position = getCelestialPosition(progress, width, height);
      active.setPosition(position.x, position.y).setAlpha(1);
    }
    inactive?.setAlpha(0);
  }

  private drawSky(): void {
    const { width, height } = this.scale;
    const cloudConfig = [
      { texture: 0, x: .08, y: .18, scale: .62, speed: 2.4 }, { texture: 2, x: .58, y: .13, scale: .54, speed: 2.1 },
      { texture: 1, x: .84, y: .27, scale: .56, speed: 2.7 }, { texture: 3, x: .24, y: .36, scale: .7, speed: 5.2 },
      { texture: 4, x: .68, y: .32, scale: .62, speed: 4.6 }, { texture: 5, x: -.04, y: .43, scale: .58, speed: 5.7 },
    ];
    this.clouds = cloudConfig.map(({ texture, x, y, scale, speed }, index) => {
      const image = this.add.image(width * x, height * y, `cloud-${texture}`).setScale(scale).setAlpha(index < 3 ? .6 : .84).setDepth(3);
      return { image, speed };
    });
    this.sun = this.add.image(0, 0, "sun").setScale(.52).setDepth(2);
    this.moon = this.add.image(0, 0, "moon").setScale(.5).setDepth(2).setAlpha(0);
  }

  private createAnimations(): void {
    this.anims.create({ key: "walk-front", frames: [0, 1, 2, 3].map((index) => ({ key: `villager-${index}` })), frameRate: 7, repeat: -1 });
    this.anims.create({ key: "walk-back", frames: [4, 5, 6, 7].map((index) => ({ key: `villager-${index}` })), frameRate: 7, repeat: -1 });
    this.anims.create({ key: "work-farm", frames: [8, 9, 10, 11].map((index) => ({ key: `villager-${index}` })), frameRate: 5, repeat: -1 });
    this.anims.create({ key: "work-lumber", frames: [12, 13, 14, 15].map((index) => ({ key: `villager-${index}` })), frameRate: 5, repeat: -1 });
    this.anims.create({ key: "woman-walk-front", frames: [0, 1, 2, 3].map((index) => ({ key: `villager-woman-${index}` })), frameRate: 7, repeat: -1 });
    this.anims.create({ key: "woman-walk-back", frames: [4, 5, 6, 7].map((index) => ({ key: `villager-woman-${index}` })), frameRate: 7, repeat: -1 });
    this.anims.create({ key: "woman-work-farm", frames: [8, 9, 10, 11].map((index) => ({ key: `villager-woman-${index}` })), frameRate: 5, repeat: -1 });
    this.anims.create({ key: "woman-work-lumber", frames: [12, 13, 14, 15].map((index) => ({ key: `villager-woman-${index}` })), frameRate: 5, repeat: -1 });
  }

  private createVillager(index: number, variant: "man" | "woman"): Phaser.GameObjects.Sprite {
    const { width, height } = this.scale;
    const texture = variant === "woman" ? "villager-woman-0" : "villager-0";
    const mode = modeForWidth(width);
    const projection = getWorldProjection({ width, height }, mode);
    const spawn = projectWorldPoint(getWorldLayout(mode).townDoor, { width, height }, mode);
    const sprite = this.add.sprite(spawn.x, spawn.y, texture).setDepth(20).setScale(projection.mapHeight * .052 / 344);
    const tints = [0xffffff, 0xffd4c7, 0xd6eeff, 0xe1d4ff, 0xd7f1ce, 0xffe8b8, 0xd8d8d8, 0xf7cde3, 0xc9e7e5, 0xffd6a8];
    sprite.setTint(tints[index % tints.length]);
    sprite.play(variant === "woman" ? "woman-walk-front" : "walk-front");
    return sprite;
  }

  private moveVillagers(force = false): void {
    if (this.options.reducedMotion && !force) return;
    const { width, height } = this.scale;
    const layout = getWorldLayout(modeForWidth(width));
    const groupIndex = new Map<WorkSite, number>();
    const assignedWorkers = this.currentState.villagers.filter(({ assignment }) => assignment !== "idle").length;
    if (!this.isNight) this.options.onWorkStatus(assignedWorkers === 0 || this.allWorkersAtWork());
    this.currentState.villagers.forEach((villager, index) => {
      const view = this.villagers.get(villager.id);
      if (!view || (view.moving && !force)) return;
      if (force) { view.departure?.remove(false); this.tweens.killTweensOf(view.sprite); view.moving = false; view.destination = "none"; }
      if (this.isNight) {
        if (view.destination === "town") return;
        const workSite = villager.assignment as WorkSite;
        const coworker = villager.assignment === "idle" ? index : groupIndex.get(workSite) ?? 0;
        if (villager.assignment !== "idle") groupIndex.set(workSite, coworker + 1);
        const route = villager.assignment === "idle" ? [layout.townDoor] : createWorkerRoute(layout, workSite, coworker, "toTown");
        this.walkRoute(view, route, () => { view.destination = "town"; view.sprite.setVisible(false); });
      } else if (villager.assignment === "idle") {
        view.sprite.setVisible(true);
        view.wanderStep += 1;
        const destination = layout.wanderPoints[(view.wanderStep + index * 2) % layout.wanderPoints.length];
        this.walkRoute(view, [destination]);
      } else {
        if (view.destination === "work") return;
        view.sprite.setVisible(true);
        const workSite = villager.assignment as WorkSite;
        const coworker = groupIndex.get(workSite) ?? 0;
        groupIndex.set(workSite, coworker + 1);
        const route = createWorkerRoute(layout, workSite, coworker, "toWork");
        const depart = () => this.walkRoute(view, route, () => {
          const prefix = view.variant === "woman" ? "woman-" : "";
          view.sprite.play(`${prefix}${villager.assignment === "farm" ? "work-farm" : "work-lumber"}`, true);
          view.destination = "work";
          if (this.allWorkersAtWork()) this.options.onWorkStatus(true);
        });
        view.departure = this.time.delayedCall(this.options.reducedMotion ? 0 : coworker * 420 + (index % 3) * 130, depart);
      }
    });
  }

  private allWorkersAtWork(): boolean {
    return this.currentState.villagers
      .filter(({ assignment }) => assignment !== "idle")
      .every(({ id }) => this.villagers.get(id)?.destination === "work");
  }

  private walkRoute(view: VillagerView, route: Point[], onComplete?: () => void): void {
    const { width, height } = this.scale;
    const mode = modeForWidth(width);
    view.moving = true;
    const next = (index: number) => {
      const point = route[index];
      if (!point) { view.moving = false; onComplete?.(); return; }
      const projected = projectWorldPoint({ x: point.x, y: point.y + .025 }, { width, height }, mode);
      const { x, y } = projected;
      const distance = Phaser.Math.Distance.Between(view.sprite.x, view.sprite.y, x, y);
      const prefix = view.variant === "woman" ? "woman-" : "";
      view.sprite.play(`${prefix}${y < view.sprite.y ? "walk-back" : "walk-front"}`, true);
      this.tweens.add({
        targets: view.sprite, x, y, duration: Math.max(650, distance / 55 * 1000), ease: "Linear",
        onComplete: () => next(index + 1),
      });
    };
    next(0);
  }

  private setNight(night: boolean): void {
    this.options.onWorkStatus(false);
    this.tweens.add({ targets: this.nightOverlay, fillAlpha: night ? .55 : 0, duration: 1800 });
    this.tweens.add({ targets: this.stars, alpha: night ? .9 : 0, duration: 1800 });
    this.tweens.add({ targets: this.townGlow, fillAlpha: night && this.currentState.unlocked.town ? .28 : 0, duration: 1500 });
    this.options.onPhase(night ? "Night" : "Day");
  }
}
