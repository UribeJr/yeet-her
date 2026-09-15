import Phaser from 'phaser';

/** A short caption ("CAFFEINATED!", "+300 FT") that rises and fades at a world position. */
export function spawnFloatingText(
  scene: Phaser.Scene,
  worldX: number,
  worldY: number,
  text: string,
  color = '#ffcc33'
): void {
  const label = scene.add
    .text(worldX, worldY, text, {
      fontFamily: 'Trebuchet MS, Verdana, sans-serif',
      fontSize: '24px',
      color,
      fontStyle: 'bold',
      stroke: '#1a1a2e',
      strokeThickness: 5,
    })
    .setOrigin(0.5)
    .setDepth(150)
    .setScale(0.6);

  scene.tweens.add({
    targets: label,
    y: worldY - 70,
    scale: 1,
    alpha: 0,
    duration: 900,
    ease: 'Cubic.Out',
    onComplete: () => label.destroy(),
  });
}
