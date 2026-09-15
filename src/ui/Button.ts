import Phaser from 'phaser';
import { Colors } from '../config/Colors';

export interface ButtonOptions {
  width?: number;
  height?: number;
  fontSize?: string;
  bgColor?: number;
  bgHoverColor?: number;
  textColor?: string;
}

/** A rounded, hover/press-responsive button drawn from Graphics - no image assets needed. */
export class Button extends Phaser.GameObjects.Container {
  private readonly bg: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private readonly width_: number;
  private readonly height_: number;
  private readonly bgColor: number;
  private readonly bgHoverColor: number;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, opts: ButtonOptions = {}) {
    super(scene, x, y);
    this.width_ = opts.width ?? 260;
    this.height_ = opts.height ?? 64;
    this.bgColor = opts.bgColor ?? Colors.uiAccent;
    this.bgHoverColor = opts.bgHoverColor ?? Colors.uiAccentDark;

    this.bg = scene.add.graphics();
    this.drawBg(this.bgColor);

    this.label = scene.add
      .text(0, 0, text, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: opts.fontSize ?? '26px',
        color: opts.textColor ?? '#1a1a2e',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add([this.bg, this.label]);
    this.setSize(this.width_, this.height_);
    this.setInteractive({ useHandCursor: true, hitArea: new Phaser.Geom.Rectangle(-this.width_ / 2, -this.height_ / 2, this.width_, this.height_), hitAreaCallback: Phaser.Geom.Rectangle.Contains });

    this.on('pointerover', () => this.drawBg(this.bgHoverColor));
    this.on('pointerout', () => {
      this.drawBg(this.bgColor);
      this.setScale(1);
    });
    this.on('pointerdown', () => this.setScale(0.94));
    this.on('pointerup', () => this.setScale(1));

    scene.add.existing(this);
  }

  private drawBg(color: number): void {
    this.bg.clear();
    this.bg.fillStyle(0x1a1a2e, 0.25);
    this.bg.fillRoundedRect(-this.width_ / 2 + 3, -this.height_ / 2 + 5, this.width_, this.height_, 16);
    this.bg.fillStyle(color, 1);
    this.bg.fillRoundedRect(-this.width_ / 2, -this.height_ / 2, this.width_, this.height_, 16);
    this.bg.lineStyle(3, 0x1a1a2e, 0.5);
    this.bg.strokeRoundedRect(-this.width_ / 2, -this.height_ / 2, this.width_, this.height_, 16);
  }

  setText(text: string): void {
    this.label.setText(text);
  }
}
