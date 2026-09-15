import Phaser from 'phaser';

/**
 * Wraps a Phaser DOM Element text input so it tracks the Scale.FIT letterbox/scale
 * automatically (a manually-positioned absolute <input> would not).
 */
export class TextInputOverlay {
  readonly domElement: Phaser.GameObjects.DOMElement;
  private readonly input: HTMLInputElement;

  constructor(scene: Phaser.Scene, x: number, y: number, placeholder: string, width = 640) {
    const html = `<input type="text" maxlength="80" placeholder="${placeholder}" style="
      width:${width}px; height:56px; font-size:22px; font-family:'Trebuchet MS',Verdana,sans-serif;
      padding:0 18px; border-radius:14px; border:3px solid #1a1a2e; outline:none;
      box-sizing:border-box; background:#fffdf5; color:#1a1a2e; text-align:center;
    "/>`;

    this.domElement = scene.add.dom(x, y).createFromHTML(html).setOrigin(0.5);
    this.input = this.domElement.node.querySelector('input') as HTMLInputElement;

    // Stop keyboard/pointer events on the field from also driving game input (charge/boost).
    this.input.addEventListener('keydown', (e) => e.stopPropagation());
    this.input.addEventListener('pointerdown', (e) => e.stopPropagation());
  }

  getValue(): string {
    return this.input.value.trim();
  }

  focus(): void {
    this.input.focus();
  }

  destroy(): void {
    this.domElement.destroy();
  }
}
