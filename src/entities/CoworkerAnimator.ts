import Phaser from 'phaser';
import { Coworker } from './Coworker';

/** Squash/stretch + expression helpers, kept separate from Coworker so the entity stays a dumb container. */
export class CoworkerAnimator {
  constructor(private readonly scene: Phaser.Scene, private readonly coworker: Coworker) {}

  playChargeWobble(chargePct: number): void {
    const s = 1 + (chargePct / 100) * 0.08;
    this.coworker.setScale(1 / s, s);
  }

  playLaunchStretch(): void {
    this.coworker.setScale(1.35, 0.65);
    this.scene.tweens.add({
      targets: this.coworker,
      scaleX: 1,
      scaleY: 1,
      duration: 380,
      ease: 'Elastic.Out',
      easeParams: [1, 0.6],
    });
  }

  playBounceSquash(intensity: number): void {
    const amt = Phaser.Math.Clamp(intensity, 0.15, 0.5);
    this.coworker.setScale(1 + amt, 1 - amt);
    this.scene.tweens.add({
      targets: this.coworker,
      scaleX: 1,
      scaleY: 1,
      duration: 260,
      ease: 'Back.Out',
    });
  }

  playLandingSettle(): void {
    this.coworker.setScale(1.2, 0.8);
    this.scene.tweens.add({
      targets: this.coworker,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      ease: 'Back.Out',
    });
  }

  resetScale(): void {
    this.coworker.setScale(1, 1);
  }
}
