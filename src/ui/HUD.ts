import Phaser from 'phaser';
import { UI_LABELS } from '../content/strings';
import { formatFeet, formatNumber } from '../utils/MathUtils';
import { Colors } from '../config/Colors';

/** The always-visible flight HUD: distance, speed, remaining boosts, high score. Fixed to camera. */
export class HUD extends Phaser.GameObjects.Container {
  private readonly distanceText: Phaser.GameObjects.Text;
  private readonly speedText: Phaser.GameObjects.Text;
  private readonly boostText: Phaser.GameObjects.Text;
  private readonly highScoreText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, highScoreFt: number) {
    super(scene, 0, 0);
    this.setScrollFactor(0);
    this.setDepth(200);

    const style = {
      fontFamily: 'Trebuchet MS, Verdana, sans-serif',
      fontSize: '46px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#1a1a2e',
      strokeThickness: 6,
    };

    this.distanceText = scene.add.text(30, 24, '0 FT', style).setOrigin(0, 0);

    this.speedText = scene.add
      .text(30, 78, '', {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '20px',
        color: '#e8ecf4',
        stroke: '#1a1a2e',
        strokeThickness: 4,
      })
      .setOrigin(0, 0);

    this.boostText = scene.add
      .text(0, 24, '', {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '26px',
        color: '#ffcc33',
        fontStyle: 'bold',
        stroke: '#1a1a2e',
        strokeThickness: 5,
      })
      .setOrigin(1, 0);

    this.highScoreText = scene.add
      .text(0, 60, `${UI_LABELS.highScore}: ${formatFeet(highScoreFt)}`, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '18px',
        color: '#cfe8ff',
        stroke: '#1a1a2e',
        strokeThickness: 3,
      })
      .setOrigin(1, 0);

    this.add([this.distanceText, this.speedText, this.boostText, this.highScoreText]);
    scene.add.existing(this);

    this.layout(scene.cameras.main.width);
  }

  layout(camWidth: number): void {
    this.boostText.setX(camWidth - 24);
    this.highScoreText.setX(camWidth - 24);
  }

  setDistance(ft: number): void {
    this.distanceText.setText(formatFeet(ft));
  }

  setSpeed(ftPerSec: number): void {
    this.speedText.setText(`SPEED: ${formatNumber(ftPerSec)} FT/S`);
  }

  setBoosts(remaining: number): void {
    this.boostText.setText(`${UI_LABELS.rageBoostPrefix}${remaining}`);
    this.boostText.setColor(remaining > 0 ? '#ffcc33' : '#8a8fa8');
  }

  flashHighScore(): void {
    this.highScoreText.setColor('#' + Colors.uiGreen.toString(16).padStart(6, '0'));
  }
}
