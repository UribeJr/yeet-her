import Phaser from 'phaser';
import { Balance } from '../config/Balance';
import { Zone } from './ZoneManager';

const PX_PER_FT = Balance.RENDER_SCALE_PX_PER_FT;
const ftToPx = (ft: number) => ft * PX_PER_FT;

interface PropSpec {
  key: string;
  scale: number;
  yOffset: number; // offset from that layer's horizon line, negative = up
}

interface ZoneDef {
  zone: Zone;
  startPx: number;
  endPx: number;
  skyTop: number;
  skyBottom: number;
  groundTexture: string;
  farProps: PropSpec[];
  midProps: PropSpec[];
  farSpacingPx: number;
  midSpacingPx: number;
}

const ZONE_DEFS: ZoneDef[] = [
  {
    zone: Zone.OFFICE,
    startPx: ftToPx(0),
    endPx: ftToPx(500),
    skyTop: 0xbfe3f7,
    skyBottom: 0xeaf6ff,
    groundTexture: 'ground_office',
    farProps: [{ key: 'prop_cubicle', scale: 1, yOffset: -30 }],
    midProps: [
      { key: 'prop_desk', scale: 1, yOffset: -17 },
      { key: 'prop_printer', scale: 1, yOffset: -13 },
      { key: 'prop_coffee', scale: 1, yOffset: -13 },
    ],
    farSpacingPx: 260,
    midSpacingPx: 340,
  },
  {
    zone: Zone.PARKING_LOT,
    startPx: ftToPx(500),
    endPx: ftToPx(1500),
    skyTop: 0x9fd0ef,
    skyBottom: 0xdcecf7,
    groundTexture: 'ground_parking',
    farProps: [{ key: 'prop_sign', scale: 1.2, yOffset: -46 }],
    midProps: [
      { key: 'prop_car', scale: 1, yOffset: -15 },
      { key: 'prop_cart', scale: 1, yOffset: -13 },
    ],
    farSpacingPx: 420,
    midSpacingPx: 380,
  },
  {
    zone: Zone.CITY,
    startPx: ftToPx(1500),
    endPx: ftToPx(4000),
    skyTop: 0x8fc2e8,
    skyBottom: 0xcfe4f2,
    groundTexture: 'ground_city',
    farProps: [
      { key: 'prop_building', scale: 1, yOffset: -110 },
      { key: 'prop_building2', scale: 1, yOffset: -80 },
    ],
    midProps: [{ key: 'prop_trafficSign', scale: 1, yOffset: -20 }],
    farSpacingPx: 260,
    midSpacingPx: 300,
  },
  {
    zone: Zone.COUNTRYSIDE,
    startPx: ftToPx(4000),
    endPx: ftToPx(8000),
    skyTop: 0x8fd3f4,
    skyBottom: 0xdff2f9,
    groundTexture: 'ground_countryside',
    farProps: [{ key: 'prop_billboard', scale: 1, yOffset: -60 }],
    midProps: [
      { key: 'prop_tree', scale: 1, yOffset: -45 },
      { key: 'prop_cow', scale: 1, yOffset: -16 },
    ],
    farSpacingPx: 700,
    midSpacingPx: 420,
  },
  {
    zone: Zone.CLOUDS,
    startPx: ftToPx(8000),
    endPx: ftToPx(15000),
    skyTop: 0x6fa9e0,
    skyBottom: 0xe8f2fb,
    groundTexture: 'ground_clouds',
    farProps: [
      { key: 'prop_cloud', scale: 1.2, yOffset: -140 },
      { key: 'prop_plane', scale: 1, yOffset: -180 },
    ],
    midProps: [
      { key: 'prop_cloud', scale: 0.8, yOffset: -60 },
      { key: 'prop_bird', scale: 1, yOffset: -90 },
    ],
    farSpacingPx: 500,
    midSpacingPx: 360,
  },
  {
    zone: Zone.SPACE,
    startPx: ftToPx(15000),
    endPx: ftToPx(60000),
    skyTop: 0x0b0d2a,
    skyBottom: 0x2a2f5c,
    groundTexture: 'ground_space',
    farProps: [{ key: 'prop_planet', scale: 1, yOffset: -260 }],
    midProps: [
      { key: 'prop_satellite', scale: 1, yOffset: -120 },
      { key: 'particle_dot', scale: 0.6, yOffset: -160 },
    ],
    farSpacingPx: 3000,
    midSpacingPx: 260,
  },
];

const TRANSITION_WINDOW_PX = 500;

function lerpColor(colorA: number, colorB: number, t: number): number {
  const a = Phaser.Display.Color.IntegerToColor(colorA);
  const b = Phaser.Display.Color.IntegerToColor(colorB);
  const r = Phaser.Math.Linear(a.red, b.red, t);
  const g = Phaser.Math.Linear(a.green, b.green, t);
  const bl = Phaser.Math.Linear(a.blue, b.blue, t);
  return Phaser.Display.Color.GetColor(r, g, bl);
}

export class ParallaxManager {
  private readonly scene: Phaser.Scene;
  private readonly groundY: number;
  private sky!: Phaser.GameObjects.Rectangle;
  private groundA!: Phaser.GameObjects.TileSprite;
  private groundB!: Phaser.GameObjects.TileSprite;
  private currentZoneIndex = 0;

  constructor(scene: Phaser.Scene, groundY: number) {
    this.scene = scene;
    this.groundY = groundY;
    this.buildSky();
    this.buildGround();
    this.buildProps();
  }

  private buildSky(): void {
    const cam = this.scene.cameras.main;
    this.sky = this.scene.add.rectangle(0, 0, cam.width, cam.height, ZONE_DEFS[0].skyTop).setOrigin(0, 0);
    this.sky.setScrollFactor(0);
    this.sky.setDepth(-100);
  }

  private buildGround(): void {
    const width = 300000;
    const height = 400;
    this.groundA = this.scene.add
      .tileSprite(0, this.groundY, width, height, ZONE_DEFS[0].groundTexture)
      .setOrigin(0, 0)
      .setDepth(-40);
    this.groundB = this.scene.add
      .tileSprite(0, this.groundY, width, height, ZONE_DEFS[0].groundTexture)
      .setOrigin(0, 0)
      .setDepth(-40)
      .setAlpha(0);
  }

  private buildProps(): void {
    for (const def of ZONE_DEFS) {
      const span = def.endPx - def.startPx;
      this.scatterLayer(def.farProps, def.startPx, span, def.farSpacingPx, -60);
      this.scatterLayer(def.midProps, def.startPx, span, def.midSpacingPx, -55);
    }
  }

  private scatterLayer(specs: PropSpec[], startPx: number, span: number, spacing: number, depth: number): void {
    if (specs.length === 0) return;
    const count = Math.min(400, Math.floor(span / spacing));
    for (let i = 0; i < count; i++) {
      const spec = specs[i % specs.length];
      const jitterX = (Math.random() - 0.5) * spacing * 0.4;
      const x = startPx + i * spacing + jitterX;
      const img = this.scene.add.image(x, this.groundY + spec.yOffset, spec.key);
      const scaleVariance = 0.85 + Math.random() * 0.3;
      img.setScale(spec.scale * scaleVariance);
      // Deliberately left at the default scrollFactor=1 (true world position): these props
      // are zone-exclusive decoration, and a fractional scroll factor makes them lag the
      // camera and linger visually long after the player has actually left their zone.
      // "Depth" comes from y-offset/scale/alpha instead of true parallax speed.
      img.setDepth(depth);
      img.setAlpha(0.92);
    }
  }

  /** Call every frame with the world-px x position of the camera/player to update sky color and ground texture. */
  update(worldPx: number): void {
    const idx = this.zoneIndexForPx(worldPx);
    const def = ZONE_DEFS[idx];

    // Sky color: blend across a transition window at each zone boundary for a smooth fade.
    let color = def.skyTop;
    const distIntoZone = worldPx - def.startPx;
    const distToEnd = def.endPx - worldPx;
    const next = ZONE_DEFS[Math.min(idx + 1, ZONE_DEFS.length - 1)];
    if (distToEnd < TRANSITION_WINDOW_PX && next !== def) {
      const t = 1 - Phaser.Math.Clamp(distToEnd / TRANSITION_WINDOW_PX, 0, 1);
      color = lerpColor(def.skyTop, next.skyTop, t);
    } else if (distIntoZone < TRANSITION_WINDOW_PX && idx > 0) {
      const prev = ZONE_DEFS[idx - 1];
      const t = Phaser.Math.Clamp(distIntoZone / TRANSITION_WINDOW_PX, 0, 1);
      color = lerpColor(prev.skyTop, def.skyTop, t);
    }
    this.sky.setFillStyle(color);

    if (idx !== this.currentZoneIndex) {
      this.currentZoneIndex = idx;
      // Crossfade the idle ground layer to the new zone's texture, then swap roles.
      const incoming = this.groundA.alpha === 0 ? this.groundA : this.groundB;
      const outgoing = incoming === this.groundA ? this.groundB : this.groundA;
      incoming.setTexture(def.groundTexture);
      incoming.tilePositionX = outgoing.tilePositionX;
      this.scene.tweens.add({ targets: incoming, alpha: 1, duration: 500 });
      this.scene.tweens.add({ targets: outgoing, alpha: 0, duration: 500 });
    }

    this.groundA.tilePositionX = worldPx;
    this.groundB.tilePositionX = worldPx;
  }

  private zoneIndexForPx(worldPx: number): number {
    let idx = 0;
    for (let i = 0; i < ZONE_DEFS.length; i++) {
      if (worldPx >= ZONE_DEFS[i].startPx) idx = i;
    }
    return idx;
  }
}
