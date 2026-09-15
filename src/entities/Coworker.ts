import Phaser from 'phaser';
import { Expression } from '../world/TextureFactory';

/**
 * The whole character as one Container, built entirely from pre-baked textures -
 * a standalone doll/ragdoll figure (no chair): head, hair, torso, and four limb
 * segments (upper/lower arm, upper/lower leg) per side. Local origin (0,0) sits
 * at ground level, centered under the feet, so FlightPhysics can treat
 * container.y as "height above ground" directly.
 */
export class Coworker extends Phaser.GameObjects.Container {
  readonly hairBack: Phaser.GameObjects.Image;
  readonly torso: Phaser.GameObjects.Image;
  readonly upperArmL: Phaser.GameObjects.Image;
  readonly upperArmR: Phaser.GameObjects.Image;
  readonly lowerArmL: Phaser.GameObjects.Image;
  readonly lowerArmR: Phaser.GameObjects.Image;
  readonly upperLegL: Phaser.GameObjects.Image;
  readonly upperLegR: Phaser.GameObjects.Image;
  readonly lowerLegL: Phaser.GameObjects.Image;
  readonly lowerLegR: Phaser.GameObjects.Image;
  readonly head: Phaser.GameObjects.Image;

  currentExpression: Expression = 'neutral';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // Stacked bottom-up from ground level (local y=0 at the feet). Each segment
    // overlaps the next by a few px so the doll reads as one connected figure -
    // legs behind the torso (tucked-in look), arms behind the torso at the
    // shoulder seam, head and hair-back framing the top.
    this.lowerLegL = scene.add.image(-10, 0, 'body_lower_leg').setOrigin(0.5, 1);
    this.lowerLegR = scene.add.image(10, 0, 'body_lower_leg').setOrigin(0.5, 1).setFlipX(true);
    this.upperLegL = scene.add.image(-10, -26, 'body_upper_leg').setOrigin(0.5, 1);
    this.upperLegR = scene.add.image(10, -26, 'body_upper_leg').setOrigin(0.5, 1).setFlipX(true);

    this.upperArmL = scene.add.image(-27, -100, 'body_upper_arm').setOrigin(0.5, 0);
    this.upperArmR = scene.add.image(27, -100, 'body_upper_arm').setOrigin(0.5, 0).setFlipX(true);
    this.lowerArmL = scene.add.image(-27, -70, 'body_lower_arm').setOrigin(0.5, 0);
    this.lowerArmR = scene.add.image(27, -70, 'body_lower_arm').setOrigin(0.5, 0).setFlipX(true);

    this.hairBack = scene.add.image(0, -68, 'hair_back').setOrigin(0.5, 1);
    this.torso = scene.add.image(0, -50, 'body_torso').setOrigin(0.5, 1);
    this.head = scene.add.image(0, -100, 'head_neutral').setOrigin(0.5, 1);

    this.add([
      this.hairBack,
      this.lowerLegL,
      this.lowerLegR,
      this.upperLegL,
      this.upperLegR,
      this.upperArmL,
      this.upperArmR,
      this.lowerArmL,
      this.lowerArmR,
      this.torso,
      this.head,
    ]);

    scene.add.existing(this);
  }

  setExpression(expr: Expression): void {
    if (expr === this.currentExpression) return;
    this.currentExpression = expr;
    this.head.setTexture(`head_${expr}`);
  }
}
