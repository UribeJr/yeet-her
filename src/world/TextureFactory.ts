import Phaser from 'phaser';
import { Colors } from '../config/Colors';

export type Expression = 'neutral' | 'annoyed' | 'smug' | 'shocked' | 'dizzy';

/**
 * Bakes every piece of art used in the game, once, from vector Graphics calls into
 * static textures. Keeps the whole game asset-free while staying cheap at runtime
 * (everything after this is just Image/Sprite draws, no per-frame redraw).
 */
export class TextureFactory {
  static generateAll(scene: Phaser.Scene): void {
    this.genTorso(scene);
    this.genUpperArm(scene);
    this.genLowerArm(scene);
    this.genUpperLeg(scene);
    this.genLowerLeg(scene);
    this.genHairBack(scene);
    (['neutral', 'annoyed', 'smug', 'shocked', 'dizzy'] as Expression[]).forEach((expr) =>
      this.genHead(scene, expr)
    );

    this.genParticleDot(scene);
    this.genStar(scene);
    this.genPaper(scene, 'paper1', Colors.paperWhite);
    this.genPaper(scene, 'paper2', Colors.paperCream);
    this.genSpeedLine(scene);
    this.genDustPuff(scene);

    // Zone prop silhouettes - simple flat shapes, distinguished by color/size per zone.
    this.genRect(scene, 'prop_desk', 60, 34, 0xc79a63);
    this.genRect(scene, 'prop_cubicle', 46, 60, Colors.cubicleGray);
    this.genRect(scene, 'prop_printer', 34, 26, 0xb7bfc7);
    this.genRoundedRect(scene, 'prop_coffee', 20, 26, 0x6b4a35);

    this.genRoundedRect(scene, 'prop_car', 78, 30, 0xd1453b);
    this.genRect(scene, 'prop_sign', 8, 46, 0x8f9aa8);
    this.genRect(scene, 'prop_cart', 30, 26, 0xb0b6bd);

    this.genRect(scene, 'prop_building', 90, 220, Colors.cityBuilding);
    this.genRect(scene, 'prop_building2', 70, 160, 0x7a8494);
    this.genRect(scene, 'prop_trafficSign', 6, 40, 0xd1453b);

    this.genTreeTexture(scene);
    this.genCowTexture(scene);
    this.genRoundedRect(scene, 'prop_billboard', 120, 60, 0xf4ead1);

    this.genCloudTexture(scene);
    this.genBirdTexture(scene);
    this.genPlaneTexture(scene);

    this.genPlanetTexture(scene);
    this.genSatelliteTexture(scene);

    this.genReplyAllIcon(scene);
    this.genFanTexture(scene);
    this.genCouchTexture(scene);
    this.genMailCartTexture(scene);

    this.genGroundTile(scene, 'ground_office', Colors.officeFloor, 0xc7b78f);
    this.genGroundTile(scene, 'ground_parking', Colors.parkingAsphalt, 0x4a4e54);
    this.genGroundTile(scene, 'ground_city', 0x6b7280, 0x565c66);
    this.genGroundTile(scene, 'ground_countryside', Colors.countrysideGrass, 0x5a9a4c);
    this.genGroundTile(scene, 'ground_clouds', 0xe8f2fb, 0xd3e6f7);
    this.genGroundTile(scene, 'ground_space', Colors.spaceDark, 0x090b1e);
  }

  private static genGroundTile(scene: Phaser.Scene, key: string, base: number, stripe: number): void {
    this.bake(scene, key, 64, 48, (g) => {
      g.fillStyle(base, 1);
      g.fillRect(0, 0, 64, 48);
      g.fillStyle(stripe, 1);
      g.fillRect(0, 0, 64, 6);
      g.fillRect(0, 20, 32, 4);
      g.fillRect(40, 30, 24, 4);
    });
  }

  private static bake(
    scene: Phaser.Scene,
    key: string,
    w: number,
    h: number,
    draw: (g: Phaser.GameObjects.Graphics) => void
  ): void {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private static genRect(scene: Phaser.Scene, key: string, w: number, h: number, color: number): void {
    this.bake(scene, key, w, h, (g) => {
      g.fillStyle(color, 1);
      g.fillRect(0, 0, w, h);
      g.lineStyle(3, 0x1a1a2e, 0.35);
      g.strokeRect(1.5, 1.5, w - 3, h - 3);
    });
  }

  private static genRoundedRect(scene: Phaser.Scene, key: string, w: number, h: number, color: number): void {
    this.bake(scene, key, w, h, (g) => {
      const r = Math.min(10, w / 4, h / 4);
      g.fillStyle(color, 1);
      g.fillRoundedRect(0, 0, w, h, r);
      g.lineStyle(3, 0x1a1a2e, 0.35);
      g.strokeRoundedRect(1.5, 1.5, w - 3, h - 3, r);
    });
  }

  // ---- Character parts: a doll/ragdoll figure, each limb a separate segment ----
  // (baked once per shape; left/right sides reuse the same texture via setFlipX()).

  private static genTorso(scene: Phaser.Scene): void {
    this.bake(scene, 'body_torso', 46, 56, (g) => {
      g.fillStyle(Colors.shirtBlack, 1);
      g.fillRoundedRect(0, 0, 46, 56, 14);
      g.lineStyle(3, 0x000000, 0.3);
      g.strokeRoundedRect(1.5, 1.5, 43, 53, 14);

      // Small white logo mark on the chest.
      this.drawLogoMark(g, 9, 9, 0.75);
    });
  }

  // A right-pointing "play" triangle whose base corner meets the tip of a downward
  // chevron - drawn in a 40x40 design grid, then positioned/scaled onto whatever
  // it's baked into. The chevron arms are built as true constant-width strokes
  // (perpendicular offset, not just an x-shift) so they read as clean diagonal
  // bars instead of a skewed/twisted blob.
  private static drawLogoMark(g: Phaser.GameObjects.Graphics, offsetX: number, offsetY: number, scale: number): void {
    type Pt = { x: number; y: number };
    const p = (x: number, y: number): Pt => ({ x: offsetX + x * scale, y: offsetY + y * scale });
    const thickLine = (a: Pt, b: Pt, thickness: number): Pt[] => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = (-dy / len) * (thickness / 2);
      const ny = (dx / len) * (thickness / 2);
      return [
        { x: a.x + nx, y: a.y + ny },
        { x: b.x + nx, y: b.y + ny },
        { x: b.x - nx, y: b.y - ny },
        { x: a.x - nx, y: a.y - ny },
      ];
    };

    g.fillStyle(0xffffff, 1);

    const tip = p(18, 34);
    const leftTop = p(4, 8);
    const rightTop = p(24, 10);
    const thickness = 7 * scale;

    g.fillPoints(thickLine(tip, leftTop, thickness), true);
    g.fillPoints(thickLine(tip, rightTop, thickness), true);

    // Play-style triangle, apex pointing right, its lower-left corner just meeting the chevron's tip.
    g.fillPoints([p(20, 4), p(20, 26), p(37, 15)], true);
  }

  private static genUpperArm(scene: Phaser.Scene): void {
    this.bake(scene, 'body_upper_arm', 18, 36, (g) => {
      g.fillStyle(Colors.shirtBlack, 1);
      g.fillRoundedRect(0, 0, 18, 36, 8);
      g.lineStyle(2.5, 0x000000, 0.3);
      g.strokeRoundedRect(1.25, 1.25, 15.5, 33.5, 8);
    });
  }

  private static genLowerArm(scene: Phaser.Scene): void {
    this.bake(scene, 'body_lower_arm', 16, 34, (g) => {
      g.fillStyle(Colors.skinTone, 1);
      g.fillRoundedRect(1, 0, 14, 24, 6);
      g.fillCircle(8, 27, 7);
      g.lineStyle(2, 0x1a1a2e, 0.2);
      g.strokeRoundedRect(2, 1, 12, 22, 6);
    });
  }

  private static genUpperLeg(scene: Phaser.Scene): void {
    this.bake(scene, 'body_upper_leg', 20, 32, (g) => {
      g.fillStyle(Colors.pantsNavy, 1);
      g.fillRoundedRect(0, 0, 20, 32, 8);
      g.lineStyle(2.5, 0x000000, 0.25);
      g.strokeRoundedRect(1.25, 1.25, 17.5, 29.5, 8);
    });
  }

  private static genLowerLeg(scene: Phaser.Scene): void {
    this.bake(scene, 'body_lower_leg', 18, 34, (g) => {
      g.fillStyle(Colors.pantsNavy, 1);
      g.fillRoundedRect(1, 0, 16, 20, 6);
      // shoe
      g.fillStyle(0x1a1a1e, 1);
      g.fillRoundedRect(0, 18, 18, 12, 5);
    });
  }

  private static genHairBack(scene: Phaser.Scene): void {
    // Long hair draping from head-level down behind the shoulders/upper back - a
    // separate piece (not baked into the head texture) so it isn't clipped to the
    // small head canvas.
    this.bake(scene, 'hair_back', 58, 96, (g) => {
      g.fillStyle(Colors.hairDarkBrown, 1);
      g.fillRoundedRect(4, 0, 50, 80, 22);
      g.fillTriangle(4, 60, 29, 96, 4, 96);
      g.fillTriangle(54, 60, 29, 96, 54, 96);
    });
  }

  private static genHead(scene: Phaser.Scene, expression: Expression): void {
    this.bake(scene, `head_${expression}`, 64, 78, (g) => {
      // Hair back-mass (medium-length bob, drawn behind the face). Wider and taller
      // than the face oval so it frames the face at the sides/shoulders, but the
      // face oval below fully covers the chin so it never reads as a beard.
      g.fillStyle(Colors.hairDarkBrown, 1);
      g.fillRoundedRect(0, 14, 64, 56, 22);

      // face (skin) - bottom edge matches the hair mass's bottom edge exactly so no
      // dark hair sliver peeks out under the chin (which would read as a goatee).
      g.fillStyle(Colors.skinTone, 1);
      g.fillEllipse(32, 44, 40, 52);

      // hair top fringe + side panels framing the face
      g.fillStyle(Colors.hairDarkBrown, 1);
      g.beginPath();
      g.arc(32, 22, 25, Math.PI, 0, false);
      g.fillPath();

      this.drawExpression(g, expression);
    });
  }

  private static drawExpression(g: Phaser.GameObjects.Graphics, expression: Expression): void {
    const cx = 32;
    const eyeY = 36;
    g.lineStyle(3, 0x1a1a1e, 1);

    switch (expression) {
      case 'annoyed':
        // narrowed eyes + angled brows + flat unimpressed mouth
        g.strokeLineShape(new Phaser.Geom.Line(cx - 14, eyeY - 6, cx - 4, eyeY - 3));
        g.strokeLineShape(new Phaser.Geom.Line(cx + 4, eyeY - 3, cx + 14, eyeY - 6));
        g.fillStyle(0x1a1a1e, 1);
        g.fillRect(cx - 14, eyeY, 8, 3);
        g.fillRect(cx + 6, eyeY, 8, 3);
        g.strokeLineShape(new Phaser.Geom.Line(cx - 10, eyeY + 16, cx + 10, eyeY + 16));
        break;
      case 'smug':
        g.fillStyle(0x1a1a1e, 1);
        g.fillRect(cx - 14, eyeY, 8, 2.5);
        g.fillRect(cx + 6, eyeY, 8, 2.5);
        g.beginPath();
        g.arc(cx, eyeY + 16, 10, 0.15 * Math.PI, 0.85 * Math.PI, false);
        g.strokePath();
        break;
      case 'shocked':
        g.fillStyle(0xffffff, 1);
        g.fillCircle(cx - 10, eyeY, 6);
        g.fillCircle(cx + 10, eyeY, 6);
        g.fillStyle(0x1a1a1e, 1);
        g.fillCircle(cx - 10, eyeY, 3);
        g.fillCircle(cx + 10, eyeY, 3);
        g.fillStyle(0x8a3b3b, 1);
        g.fillEllipse(cx, eyeY + 18, 10, 14);
        break;
      case 'dizzy':
        g.strokeLineShape(new Phaser.Geom.Line(cx - 16, eyeY - 5, cx - 6, eyeY + 5));
        g.strokeLineShape(new Phaser.Geom.Line(cx - 6, eyeY - 5, cx - 16, eyeY + 5));
        g.strokeLineShape(new Phaser.Geom.Line(cx + 6, eyeY - 5, cx + 16, eyeY + 5));
        g.strokeLineShape(new Phaser.Geom.Line(cx + 16, eyeY - 5, cx + 6, eyeY + 5));
        g.beginPath();
        g.arc(cx, eyeY + 18, 6, 0, Math.PI, true);
        g.strokePath();
        break;
      case 'neutral':
      default:
        g.fillStyle(0x1a1a1e, 1);
        g.fillCircle(cx - 10, eyeY, 3.5);
        g.fillCircle(cx + 10, eyeY, 3.5);
        g.strokeLineShape(new Phaser.Geom.Line(cx - 8, eyeY + 17, cx + 8, eyeY + 17));
        break;
    }
  }

  // ---- Particles ----

  private static genParticleDot(scene: Phaser.Scene): void {
    this.bake(scene, 'particle_dot', 10, 10, (g) => {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(5, 5, 5);
    });
  }

  private static genStar(scene: Phaser.Scene): void {
    this.bake(scene, 'particle_star', 20, 20, (g) => {
      g.fillStyle(Colors.uiAccent, 1);
      const cx = 10;
      const cy = 10;
      const points: Phaser.Geom.Point[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 10 : 4;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        points.push(new Phaser.Geom.Point(cx + Math.cos(a) * r, cy + Math.sin(a) * r));
      }
      g.fillPoints(points, true);
    });
  }

  private static genPaper(scene: Phaser.Scene, key: string, color: number): void {
    this.bake(scene, key, 16, 20, (g) => {
      g.fillStyle(color, 1);
      g.fillRect(0, 0, 16, 20);
      g.lineStyle(1, 0xcccccc, 1);
      g.strokeRect(0, 3, 16, 0);
      g.strokeRect(0, 8, 16, 0);
      g.strokeRect(0, 13, 16, 0);
    });
  }

  private static genSpeedLine(scene: Phaser.Scene): void {
    this.bake(scene, 'speed_line', 60, 4, (g) => {
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(0, 0, 60, 4, 2);
    });
  }

  private static genDustPuff(scene: Phaser.Scene): void {
    this.bake(scene, 'dust_puff', 24, 24, (g) => {
      g.fillStyle(0xcfc7ad, 0.9);
      g.fillCircle(12, 12, 12);
    });
  }

  // ---- Zone props (extra) ----

  private static genTreeTexture(scene: Phaser.Scene): void {
    this.bake(scene, 'prop_tree', 50, 90, (g) => {
      g.fillStyle(0x7a5133, 1);
      g.fillRect(20, 50, 10, 40);
      g.fillStyle(Colors.countrysideGrass, 1);
      g.fillCircle(25, 34, 26);
    });
  }

  private static genCowTexture(scene: Phaser.Scene): void {
    this.bake(scene, 'prop_cow', 48, 32, (g) => {
      g.fillStyle(0xffffff, 1);
      g.fillRoundedRect(0, 6, 40, 22, 10);
      g.fillStyle(0x2a2a2a, 1);
      g.fillCircle(10, 16, 6);
      g.fillCircle(24, 12, 5);
      g.fillCircle(30, 20, 4);
      g.fillRoundedRect(36, 0, 12, 14, 4);
      g.fillStyle(0x1a1a1e, 1);
      g.fillRect(2, 26, 6, 6);
      g.fillRect(30, 26, 6, 6);
    });
  }

  private static genCloudTexture(scene: Phaser.Scene): void {
    this.bake(scene, 'prop_cloud', 100, 50, (g) => {
      g.fillStyle(0xffffff, 0.95);
      g.fillCircle(30, 30, 22);
      g.fillCircle(55, 22, 26);
      g.fillCircle(78, 30, 18);
      g.fillRect(20, 30, 65, 18);
    });
  }

  private static genBirdTexture(scene: Phaser.Scene): void {
    this.bake(scene, 'prop_bird', 24, 12, (g) => {
      g.lineStyle(2.5, 0x2a2a2a, 1);
      g.strokeLineShape(new Phaser.Geom.Line(0, 8, 12, 0));
      g.strokeLineShape(new Phaser.Geom.Line(12, 0, 24, 8));
    });
  }

  private static genPlaneTexture(scene: Phaser.Scene): void {
    this.bake(scene, 'prop_plane', 60, 20, (g) => {
      g.fillStyle(0xe8ecf2, 1);
      g.fillRoundedRect(0, 6, 60, 10, 5);
      g.fillTriangle(20, 10, 32, 0, 40, 10);
      g.fillTriangle(20, 12, 32, 20, 40, 12);
    });
  }

  private static genPlanetTexture(scene: Phaser.Scene): void {
    this.bake(scene, 'prop_planet', 900, 300, (g) => {
      g.fillStyle(0x3a6fb0, 1);
      g.fillCircle(450, 0, 300);
      g.fillStyle(0x4a8f5a, 1);
      g.fillCircle(300, -40, 70);
      g.fillCircle(620, -20, 90);
    });
  }

  private static genSatelliteTexture(scene: Phaser.Scene): void {
    this.bake(scene, 'prop_satellite', 40, 24, (g) => {
      g.fillStyle(0xc7ccd4, 1);
      g.fillRect(15, 8, 10, 8);
      g.fillStyle(0x3a6fb0, 1);
      g.fillRect(0, 10, 13, 4);
      g.fillRect(27, 10, 13, 4);
    });
  }

  // ---- Interactable object art ----

  private static genReplyAllIcon(scene: Phaser.Scene): void {
    this.bake(scene, 'obj_replyall', 40, 32, (g) => {
      g.fillStyle(Colors.uiWhite, 1);
      g.fillRoundedRect(0, 0, 40, 28, 4);
      g.lineStyle(2.5, Colors.uiAccentDark, 1);
      g.strokeRoundedRect(1, 1, 38, 26, 4);
      g.beginPath();
      g.moveTo(2, 3);
      g.lineTo(20, 17);
      g.lineTo(38, 3);
      g.strokePath();
      g.fillStyle(Colors.uiRed, 1);
      g.fillCircle(30, 6, 7);
    });
  }

  private static genFanTexture(scene: Phaser.Scene): void {
    this.bake(scene, 'obj_fan', 56, 56, (g) => {
      g.fillStyle(0x8f9aa8, 1);
      g.fillCircle(28, 28, 26);
      g.fillStyle(0x2c2c34, 1);
      for (let i = 0; i < 4; i++) {
        const a = (Math.PI / 2) * i;
        g.fillEllipse(28 + Math.cos(a) * 12, 28 + Math.sin(a) * 12, 16, 7);
      }
      g.fillStyle(0xd8dce2, 1);
      g.fillCircle(28, 28, 6);
    });
  }

  private static genCouchTexture(scene: Phaser.Scene): void {
    this.bake(scene, 'obj_couch', 110, 56, (g) => {
      g.fillStyle(0x7a5bd1, 1);
      g.fillRoundedRect(0, 18, 110, 30, 10);
      g.fillRoundedRect(0, 0, 20, 48, 8);
      g.fillRoundedRect(90, 0, 20, 48, 8);
      g.fillRoundedRect(10, 10, 90, 20, 8);
    });
  }

  private static genMailCartTexture(scene: Phaser.Scene): void {
    this.bake(scene, 'obj_mailcart', 60, 42, (g) => {
      g.fillStyle(0xb0813a, 1);
      g.fillRoundedRect(0, 0, 60, 30, 4);
      g.lineStyle(2, 0x6b4a1f, 1);
      g.strokeRect(0, 8, 60, 0);
      g.strokeRect(0, 16, 60, 0);
      g.fillStyle(Colors.wheelDark, 1);
      g.fillCircle(12, 36, 6);
      g.fillCircle(48, 36, 6);
    });
  }
}
