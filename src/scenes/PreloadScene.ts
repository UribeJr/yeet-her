import Phaser from 'phaser';
import { TextureFactory } from '../world/TextureFactory';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  create(): void {
    TextureFactory.generateAll(this);
    this.scene.start('Title');
  }
}
