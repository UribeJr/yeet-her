import Phaser from 'phaser';
import { Colors } from '../config/Colors';
import { UI_LABELS } from '../content/strings';
import { Button } from '../ui/Button';
import { formatFeet, formatNumber } from '../utils/MathUtils';
import { getDestinationName } from '../world/ZoneManager';
import { GameScene } from './GameScene';

interface ResultsData {
  distanceFt: number;
  offenseText: string;
  ragePoints: number;
  isNewHigh: boolean;
  careerTotal: number;
}

export class ResultsOverlayScene extends Phaser.Scene {
  private resultsData!: ResultsData;

  constructor() {
    super('Results');
  }

  init(data: ResultsData): void {
    this.resultsData = data;
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0, 0);

    const panelW = Math.min(640, width - 80);
    const panelH = Math.min(600, height - 60);
    const panel = this.add.graphics();
    panel.fillStyle(Colors.uiPanel, 0.97);
    panel.fillRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 26);
    panel.lineStyle(4, Colors.uiAccent, 1);
    panel.strokeRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 26);

    let cursorY = height / 2 - panelH / 2 + 44;

    if (this.resultsData.isNewHigh) {
      const banner = this.add
        .text(width / 2, cursorY, UI_LABELS.newPersonalBest, {
          fontFamily: 'Trebuchet MS, Verdana, sans-serif',
          fontSize: '32px',
          fontStyle: 'bold',
          color: '#3ecf6a',
        })
        .setOrigin(0.5)
        .setScale(0.6);
      this.tweens.add({ targets: banner, scale: 1, duration: 400, ease: 'Back.Out' });
      cursorY += 50;
    }

    this.add
      .text(width / 2, cursorY + 30, formatFeet(this.resultsData.distanceFt), {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, cursorY + 78, UI_LABELS.distance, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '18px',
        color: '#9aa3c0',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    cursorY += 128;

    this.add
      .text(width / 2, cursorY, getDestinationName(this.resultsData.distanceFt), {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#ffcc33',
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, cursorY + 34, UI_LABELS.destination, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '16px',
        color: '#9aa3c0',
      })
      .setOrigin(0.5);

    cursorY += 76;

    this.add
      .text(width / 2, cursorY, UI_LABELS.todaysOffense, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '16px',
        color: '#9aa3c0',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, cursorY + 26, `"${this.resultsData.offenseText}"`, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '18px',
        fontStyle: 'italic',
        color: '#e8ecf4',
        wordWrap: { width: panelW - 80 },
        align: 'center',
      })
      .setOrigin(0.5, 0);

    cursorY += 90;

    this.add
      .text(width / 2, cursorY, `${UI_LABELS.ragePoints}: +${formatNumber(this.resultsData.ragePoints)}`, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#e0473e',
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, cursorY + 28, `${UI_LABELS.careerRage}: ${formatNumber(this.resultsData.careerTotal)}`, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '15px',
        color: '#9aa3c0',
      })
      .setOrigin(0.5);

    const buttonY = height / 2 + panelH / 2 - 70;
    const yeetAgainBtn = new Button(this, width / 2 - 150, buttonY, UI_LABELS.yeetAgain, { width: 260, height: 66 });
    yeetAgainBtn.on('pointerup', () => this.onYeetAgain());

    const changeOffenseBtn = new Button(this, width / 2 + 150, buttonY, UI_LABELS.changeOffense, {
      width: 260,
      height: 66,
      bgColor: Colors.uiPanelLight,
      textColor: '#ffffff',
    });
    changeOffenseBtn.on('pointerup', () => this.onChangeOffense());
  }

  private onYeetAgain(): void {
    const game = this.scene.get('Game') as GameScene;
    game.resetRun();
    this.scene.resume('Game');
    this.scene.stop();
  }

  private onChangeOffense(): void {
    this.scene.stop('Game');
    this.scene.start('PreLaunch');
  }
}
