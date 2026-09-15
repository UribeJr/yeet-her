import Phaser from 'phaser';
import { Balance, ObjectKind } from '../config/Balance';
import { OBJECT_DEFS } from './ObjectDefs';
import { Interactable } from './Interactable';
import { randRange, weightedPick } from '../utils/Random';

const PX_PER_FT = Balance.RENDER_SCALE_PX_PER_FT;
const MAX_OBJECTS = 300;
// Objects that float above the ground rather than sitting on it.
const FLOATING_KINDS: ObjectKind[] = ['INDUSTRIAL_FAN', 'REPLY_ALL_ICON'];

export class InteractableSpawner {
  readonly interactables: Interactable[] = [];

  constructor(scene: Phaser.Scene, groundY: number, totalSpanFt = 60000) {
    const totalSpanPx = totalSpanFt * PX_PER_FT;
    const startPx = Balance.SPAWN_START_FT * PX_PER_FT;
    const minGapPx = Balance.SPAWN_MIN_GAP_FT * PX_PER_FT;
    const maxGapPx = Balance.SPAWN_MAX_GAP_FT * PX_PER_FT;

    const weighted: Array<[string, { weightPct: number }]> = Object.entries(Balance.OBJECT_EFFECTS).map(([k, v]) => [
      k,
      v,
    ]);

    let cursorPx = startPx;
    let count = 0;
    while (cursorPx < startPx + totalSpanPx && count < MAX_OBJECTS) {
      const kind = weightedPick(weighted) as ObjectKind;
      const def = OBJECT_DEFS[kind];
      const floating = FLOATING_KINDS.includes(kind);
      const y = floating ? groundY - randRange(90, 150) : groundY - def.height / 2 + 4;

      const image = scene.add.image(cursorPx, y, def.textureKey);
      image.setDepth(-10);
      if (floating) {
        scene.tweens.add({
          targets: image,
          y: y - 14,
          duration: 900 + Math.random() * 400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.InOut',
        });
      }

      this.interactables.push(new Interactable(def, image, cursorPx, y));
      count += 1;
      cursorPx += randRange(minGapPx, maxGapPx);
    }
  }

  /** Returns the first not-yet-hit interactable within range of the given world px position. */
  findCollision(worldPx: number, worldY: number, hitRadiusPx: number): Interactable | undefined {
    return this.interactables.find((obj) => {
      if (obj.hit) return false;
      const dx = Math.abs(obj.worldPx - worldPx);
      const dy = Math.abs(obj.worldY - worldY);
      return dx < obj.halfWidth + hitRadiusPx && dy < 60;
    });
  }

  reset(): void {
    for (const obj of this.interactables) {
      obj.hit = false;
      obj.image.setAlpha(1);
      obj.image.setVisible(true);
    }
  }

  destroy(): void {
    for (const obj of this.interactables) obj.image.destroy();
    this.interactables.length = 0;
  }
}
