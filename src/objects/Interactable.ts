import Phaser from 'phaser';
import { ObjectDef } from './ObjectDefs';

export class Interactable {
  hit = false;

  constructor(
    public readonly def: ObjectDef,
    public readonly image: Phaser.GameObjects.Image,
    public readonly worldPx: number,
    public readonly worldY: number
  ) {}

  get halfWidth(): number {
    return (this.def.width * (this.image.scale || 1)) / 2;
  }
}
