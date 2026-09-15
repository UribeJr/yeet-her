import Phaser from 'phaser';

/** Big animated banner for milestones ("500 FT — ESCAPED THE OFFICE") and flight commentary. */
export class MilestoneBanner {
  private readonly scene: Phaser.Scene;
  private queue: Array<{ text: string; big: boolean }> = [];
  private busy = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  showMilestone(text: string): void {
    this.queue.push({ text, big: true });
    this.tryShowNext();
  }

  showCommentary(text: string): void {
    this.queue.push({ text, big: false });
    this.tryShowNext();
  }

  private tryShowNext(): void {
    if (this.busy || this.queue.length === 0) return;
    const next = this.queue.shift()!;
    this.busy = true;
    this.display(next.text, next.big);
  }

  private display(text: string, big: boolean): void {
    const cam = this.scene.cameras.main;
    const y = big ? cam.height * 0.28 : cam.height * 0.4;
    const fontSize = big ? '42px' : '26px';
    const color = big ? '#ffcc33' : '#ffffff';

    const label = this.scene.add
      .text(cam.width / 2, y, text, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize,
        color,
        fontStyle: 'bold',
        stroke: '#1a1a2e',
        strokeThickness: big ? 7 : 5,
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(300)
      .setAlpha(0)
      .setScale(big ? 0.7 : 0.9);

    this.scene.tweens.add({
      targets: label,
      alpha: 1,
      scale: 1,
      duration: 220,
      ease: 'Back.Out',
      onComplete: () => {
        this.scene.time.delayedCall(big ? 1300 : 1000, () => {
          this.scene.tweens.add({
            targets: label,
            alpha: 0,
            y: y - 20,
            duration: 350,
            onComplete: () => {
              label.destroy();
              this.busy = false;
              this.tryShowNext();
            },
          });
        });
      },
    });
  }
}
