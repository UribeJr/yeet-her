import Phaser from 'phaser';

/**
 * Unifies mouse, touch, and spacebar into two callbacks (down/up) so the rest of the
 * game only has one input path to reason about, whether the player is charging (hold)
 * or boosting (tap) - GameScene decides what "down"/"up" means based on its own phase.
 */
export class InputManager {
  private spaceDown = false;
  private pointerDown = false;
  private gestureActive = false;
  private downCbs: Array<() => void> = [];
  private upCbs: Array<() => void> = [];
  private readonly touchMoveHandler: (e: TouchEvent) => void;
  private readonly keyDownHandler: (e: KeyboardEvent) => void;
  private readonly keyUpHandler: (e: KeyboardEvent) => void;

  constructor(private readonly scene: Phaser.Scene) {
    scene.input.on('pointerdown', this.handlePointerDown, this);
    scene.input.on('pointerup', this.handlePointerUp, this);
    scene.input.on('pointerupoutside', this.handlePointerUp, this);

    this.keyDownHandler = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || this.spaceDown) return;
      e.preventDefault();
      this.spaceDown = true;
      this.fireDown();
    };
    this.keyUpHandler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      e.preventDefault();
      this.spaceDown = false;
      this.fireUp();
    };
    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);

    // Belt-and-suspenders scroll guard on mobile while a charge/boost gesture is active.
    this.touchMoveHandler = (e: TouchEvent) => {
      if (this.gestureActive) e.preventDefault();
    };
    window.addEventListener('touchmove', this.touchMoveHandler, { passive: false });

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
  }

  private handlePointerDown(): void {
    if (this.pointerDown) return;
    this.pointerDown = true;
    this.gestureActive = true;
    this.fireDown();
  }

  private handlePointerUp(): void {
    if (!this.pointerDown) return;
    this.pointerDown = false;
    this.gestureActive = false;
    this.fireUp();
  }

  private fireDown(): void {
    this.downCbs.forEach((cb) => cb());
  }

  private fireUp(): void {
    this.upCbs.forEach((cb) => cb());
  }

  onDown(cb: () => void): void {
    this.downCbs.push(cb);
  }

  onUp(cb: () => void): void {
    this.upCbs.push(cb);
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.handlePointerDown, this);
    this.scene.input.off('pointerup', this.handlePointerUp, this);
    this.scene.input.off('pointerupoutside', this.handlePointerUp, this);
    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('keyup', this.keyUpHandler);
    window.removeEventListener('touchmove', this.touchMoveHandler);
    this.downCbs = [];
    this.upCbs = [];
  }
}
