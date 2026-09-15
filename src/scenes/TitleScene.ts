import Phaser from 'phaser';
import { UI_LABELS } from '../content/strings';
import { Persistence } from '../state/Persistence';
import { Button } from '../ui/Button';
import { Colors } from '../config/Colors';
import { formatFeet, formatNumber } from '../utils/MathUtils';
import { audioManager } from '../audio/AudioManager';
import { Coworker } from '../entities/Coworker';

export class TitleScene extends Phaser.Scene {
  private soundButton?: Button;

  constructor() {
    super('Title');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, Colors.skyDay).setOrigin(0, 0);
    this.add.rectangle(0, height - 90, width, 90, Colors.officeFloor).setOrigin(0, 0);

    // Decorative idle coworker off to the side.
    const deco = new Coworker(this, width * 0.82, height - 90);
    deco.setScale(1.15);
    this.tweens.add({ targets: deco, angle: { from: -2, to: 2 }, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    this.add
      .text(width / 2, height * 0.22, UI_LABELS.title, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '92px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#1a1a2e',
        strokeThickness: 10,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.34, UI_LABELS.subtitle, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '26px',
        fontStyle: 'italic',
        color: '#1a1a2e',
      })
      .setOrigin(0.5);

    const playBtn = new Button(this, width / 2, height * 0.52, UI_LABELS.play, { width: 280, height: 72, fontSize: '32px' });
    playBtn.on('pointerup', () => {
      audioManager.playBoost();
      this.scene.start('PreLaunch');
    });

    const howToBtn = new Button(this, width / 2, height * 0.63, UI_LABELS.howToPlay, { width: 280, height: 58, bgColor: Colors.uiPanelLight, textColor: '#ffffff' });
    howToBtn.on('pointerup', () => this.scene.launch('HowToPlay'));

    this.soundButton = new Button(this, width / 2, height * 0.73, this.soundLabel(), {
      width: 280,
      height: 58,
      bgColor: Colors.uiPanelLight,
      textColor: '#ffffff',
    });
    this.soundButton.on('pointerup', () => {
      audioManager.toggleMute();
      this.soundButton!.setText(this.soundLabel());
    });

    const highScore = Persistence.getHighScore();
    const careerRage = Persistence.getCareerRage();
    this.add
      .text(width / 2, height * 0.85, `${UI_LABELS.highScore}: ${formatFeet(highScore)}`, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '24px',
        color: '#1a1a2e',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.91, `${UI_LABELS.careerRage}: ${formatNumber(careerRage)}`, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '20px',
        color: '#3a3a4e',
      })
      .setOrigin(0.5);
  }

  private soundLabel(): string {
    return audioManager.isMuted() ? UI_LABELS.soundOff : UI_LABELS.soundOn;
  }
}
