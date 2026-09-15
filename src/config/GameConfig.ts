import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { TitleScene } from '../scenes/TitleScene';
import { HowToPlayOverlayScene } from '../scenes/HowToPlayOverlayScene';
import { PreLaunchScene } from '../scenes/PreLaunchScene';
import { GameScene } from '../scenes/GameScene';
import { ResultsOverlayScene } from '../scenes/ResultsOverlayScene';

export const BASE_WIDTH = 1280;
export const BASE_HEIGHT = 720;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#8fd3f4',
  width: BASE_WIDTH,
  height: BASE_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
  },
  dom: {
    createContainer: true,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    HowToPlayOverlayScene,
    PreLaunchScene,
    GameScene,
    ResultsOverlayScene,
  ],
};
