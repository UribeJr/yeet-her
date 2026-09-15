import Phaser from 'phaser';
import { Colors } from '../config/Colors';
import { Balance } from '../config/Balance';

/** The HUD power bar: fill tracks charge %, with a highlighted "perfect zone" band near the top. */
export class ChargeMeter extends Phaser.GameObjects.Container {
  private readonly barWidth: number;
  private readonly barHeight: number;
  private readonly fill: Phaser.GameObjects.Graphics;
  private readonly frame: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, width = 340, height = 34) {
    super(scene, x, y);
    this.barWidth = width;
    this.barHeight = height;

    this.frame = scene.add.graphics();
    this.fill = scene.add.graphics();

    this.drawFrame();
    this.setPercent(0);

    this.add([this.fill, this.frame]);
    this.setVisible(false);
    scene.add.existing(this);
  }

  private drawFrame(): void {
    const w = this.barWidth;
    const h = this.barHeight;
    this.frame.clear();
    this.frame.fillStyle(0x14152a, 0.55);
    this.frame.fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 12);

    // Perfect-zone highlight band.
    const perfectStart = (Balance.PERFECT_ZONE_MIN_PCT / 100) * w;
    this.frame.fillStyle(Colors.uiAccent, 0.35);
    this.frame.fillRect(-w / 2 + perfectStart, -h / 2, w - perfectStart, h);

    this.frame.lineStyle(3, 0xffffff, 0.85);
    this.frame.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
  }

  setPercent(pct: number): void {
    const w = this.barWidth;
    const h = this.barHeight;
    const clamped = Phaser.Math.Clamp(pct, 0, 100);
    const filledWidth = (clamped / 100) * w;
    const color = clamped >= Balance.PERFECT_ZONE_MIN_PCT ? Colors.uiGreen : clamped > 60 ? Colors.uiAccent : 0xff8844;

    this.fill.clear();
    this.fill.fillStyle(color, 1);
    this.fill.fillRoundedRect(-w / 2, -h / 2, Math.max(6, filledWidth), h, 8);
  }
}
