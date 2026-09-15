import Phaser from 'phaser';
import { Colors } from '../config/Colors';
import { Button } from '../ui/Button';

export class HowToPlayOverlayScene extends Phaser.Scene {
  constructor() {
    super('HowToPlay');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.55).setOrigin(0, 0).setInteractive();

    const panelW = Math.min(760, width - 80);
    const panelH = Math.min(560, height - 80);
    const panel = this.add.graphics();
    panel.fillStyle(Colors.uiPanel, 1);
    panel.fillRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 24);
    panel.lineStyle(4, Colors.uiAccent, 1);
    panel.strokeRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 24);

    const top = height / 2 - panelH / 2 + 50;

    this.add
      .text(width / 2, top, 'HOW TO PLAY', {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '38px',
        fontStyle: 'bold',
        color: '#ffcc33',
      })
      .setOrigin(0.5);

    const lines = [
      '1. Tell us what she did this time (or leave it blank).',
      '2. HOLD to charge the launch meter - it wobbles, so time your release!',
      '3. Release for the 3-2-1-YEET! countdown and launch.',
      '4. While airborne, TAP / CLICK / SPACE to fire a Rage Boost (x3 per run).',
      '5. Bounce off the ground and hit objects for extra distance.',
      '6. She stops when she runs out of momentum - see how far you sent her!',
    ];

    this.add.text(width / 2 - panelW / 2 + 40, top + 60, lines.join('\n\n'), {
      fontFamily: 'Trebuchet MS, Verdana, sans-serif',
      fontSize: '19px',
      color: '#ffffff',
      wordWrap: { width: panelW - 80 },
      lineSpacing: 6,
    });

    const closeBtn = new Button(this, width / 2, height / 2 + panelH / 2 - 50, 'GOT IT', {
      width: 200,
      height: 56,
    });
    closeBtn.on('pointerup', () => this.scene.stop());
  }
}
