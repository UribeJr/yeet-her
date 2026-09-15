import Phaser from 'phaser';
import { Colors } from '../config/Colors';
import { UI_LABELS, OFFENSES } from '../content/strings';
import { Button } from '../ui/Button';
import { TextInputOverlay } from '../ui/TextInputOverlay';
import { pick } from '../utils/Random';
import { Coworker } from '../entities/Coworker';
import { audioManager } from '../audio/AudioManager';

export class PreLaunchScene extends Phaser.Scene {
  private textInput?: TextInputOverlay;

  constructor() {
    super('PreLaunch');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, Colors.officeWall).setOrigin(0, 0);
    this.add.rectangle(0, height - 100, width, 100, Colors.officeFloor).setOrigin(0, 0);
    this.add.image(width * 0.15, height - 100, 'prop_cubicle').setOrigin(0.5, 1).setAlpha(0.9);
    this.add.image(width * 0.28, height - 100, 'prop_desk').setOrigin(0.5, 1).setAlpha(0.9);
    this.add.image(width * 0.38, height - 100, 'prop_printer').setOrigin(0.5, 1).setAlpha(0.9);

    const coworker = new Coworker(this, width * 0.8, height - 100);
    coworker.setScale(1.3);
    coworker.setExpression('smug');

    this.add
      .text(width / 2, 60, 'PRE-FLIGHT PAPERWORK', {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '24px',
        color: '#1a1a2e',
        fontStyle: 'italic',
      })
      .setOrigin(0.5);

    this.showPrompt();
  }

  private showPrompt(): void {
    const { width, height } = this.scale;

    const promptText = this.add
      .text(width / 2, height * 0.28, UI_LABELS.offensePrompt, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '34px',
        fontStyle: 'bold',
        color: '#1a1a2e',
      })
      .setOrigin(0.5);

    this.textInput = new TextInputOverlay(this, width / 2, height * 0.4, UI_LABELS.offensePlaceholder, Math.min(640, width - 120));
    this.textInput.focus();

    const submitBtn = new Button(this, width / 2, height * 0.52, 'SUBMIT OFFENSE', { width: 300, height: 60 });

    submitBtn.on('pointerup', () => {
      const value = this.textInput!.getValue();
      const finalText = value.length > 0 ? value : pick(OFFENSES);
      promptText.destroy();
      this.textInput!.destroy();
      submitBtn.destroy();
      this.showOffense(finalText);
    });
  }

  private showOffense(offenseText: string): void {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height * 0.25, UI_LABELS.todaysOffense, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '26px',
        fontStyle: 'bold',
        color: '#1a1a2e',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.34, `"${offenseText}"`, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '28px',
        fontStyle: 'italic',
        color: '#3a3a4e',
        wordWrap: { width: Math.min(760, width - 120) },
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.46, UI_LABELS.recommendedSentence, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#e0473e',
      })
      .setOrigin(0.5);

    const readyBtn = new Button(this, width / 2, height * 0.6, UI_LABELS.ready, { width: 260, height: 76, fontSize: '32px' });
    readyBtn.on('pointerup', () => {
      audioManager.playBoost();
      this.scene.start('Game', { offenseText });
    });
  }
}
