import Phaser from 'phaser';
import { Balance } from '../config/Balance';
import { RunState, RunPhase } from '../state/RunState';
import { FlightPhysics } from '../physics/FlightPhysics';
import { ChargeController } from '../physics/ChargeController';
import { Coworker } from '../entities/Coworker';
import { CoworkerAnimator } from '../entities/CoworkerAnimator';
import { ParallaxManager } from '../world/ParallaxManager';
import { checkMilestones } from '../world/ZoneManager';
import { InteractableSpawner } from '../objects/InteractableSpawner';
import { applyObjectEffect } from '../objects/ObjectDefs';
import { HUD } from '../ui/HUD';
import { ChargeMeter } from '../ui/ChargeMeter';
import { MilestoneBanner } from '../ui/MilestoneBanner';
import { spawnFloatingText } from '../ui/FloatingText';
import { InputManager } from '../input/InputManager';
import { audioManager } from '../audio/AudioManager';
import { Persistence } from '../state/Persistence';
import { UI_LABELS, COMMENTARY } from '../content/strings';
import { NonRepeatingPicker } from '../utils/Random';

const PX_PER_FT = Balance.RENDER_SCALE_PX_PER_FT;

export class GameScene extends Phaser.Scene {
  // Shared across scene instances so contextual hints only show in full on a player's first run this session.
  private static hasChargedOnce = false;
  private static hasBoostedOnce = false;

  private runState = new RunState();
  private offenseText = '';
  private groundY = 0;
  private launchOriginPx = 220;
  private slowMoFactor = 1;

  private coworker!: Coworker;
  private animator!: CoworkerAnimator;
  private parallax!: ParallaxManager;
  private spawner!: InteractableSpawner;
  private chargeController = new ChargeController();
  private chargeMeter!: ChargeMeter;
  private hud!: HUD;
  private milestoneBanner!: MilestoneBanner;
  private inputManager!: InputManager;
  private commentaryPicker = new NonRepeatingPicker(COMMENTARY, 3);

  private holdLabel!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private countdownText!: Phaser.GameObjects.Text;
  private perfectText!: Phaser.GameObjects.Text;

  private paperEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private dustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private starEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super('Game');
  }

  init(data: { offenseText?: string }): void {
    this.offenseText = data.offenseText ?? '';
    this.slowMoFactor = 1;
  }

  create(): void {
    const { width, height } = this.scale;
    this.groundY = height * 0.72;

    this.parallax = new ParallaxManager(this, this.groundY);
    this.spawner = new InteractableSpawner(this, this.groundY);

    this.coworker = new Coworker(this, this.launchOriginPx, this.groundY);
    this.animator = new CoworkerAnimator(this, this.coworker);
    this.coworker.setExpression('smug');

    this.buildEmitters();

    this.chargeMeter = new ChargeMeter(this, width / 2, height * 0.9);
    this.hud = new HUD(this, Persistence.getHighScore());
    this.milestoneBanner = new MilestoneBanner(this);

    this.holdLabel = this.add
      .text(width / 2, height * 0.82, UI_LABELS.holdToCharge, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '34px',
        fontStyle: 'bold',
        color: '#ffcc33',
        stroke: '#1a1a2e',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);
    this.tweens.add({ targets: this.holdLabel, scale: 1.06, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    this.hintText = this.add
      .text(width / 2, height * 0.97, UI_LABELS.chargeHint, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '16px',
        color: '#ffffff',
        stroke: '#1a1a2e',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(200);

    this.countdownText = this.add
      .text(width / 2, height * 0.42, '', {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '110px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#1a1a2e',
        strokeThickness: 10,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(210)
      .setVisible(false);

    this.perfectText = this.add
      .text(width / 2, height * 0.2, UI_LABELS.perfectYeet, {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '48px',
        fontStyle: 'bold',
        color: '#3ecf6a',
        stroke: '#1a1a2e',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(210)
      .setVisible(false);

    this.inputManager = new InputManager(this);
    this.inputManager.onDown(() => this.handleDown());
    this.inputManager.onUp(() => this.handleUp());

    this.cameras.main.scrollX = 0;
    this.parallax.update(this.launchOriginPx);

    this.resetRun(this.offenseText);
  }

  private buildEmitters(): void {
    this.paperEmitter = this.add.particles(0, 0, 'paper1', {
      speed: { min: 90, max: 240 },
      angle: { min: 200, max: 340 },
      gravityY: 320,
      lifespan: 900,
      scale: { start: 1, end: 0.6 },
      rotate: { min: 0, max: 360 },
      quantity: 0,
      emitting: false,
    });
    this.paperEmitter.setDepth(180);

    this.dustEmitter = this.add.particles(0, 0, 'dust_puff', {
      speed: { min: 20, max: 70 },
      lifespan: 500,
      scale: { start: 0.5, end: 1.6 },
      alpha: { start: 0.7, end: 0 },
      quantity: 0,
      emitting: false,
    });
    this.dustEmitter.setDepth(170);

    this.starEmitter = this.add.particles(0, 0, 'particle_star', {
      speed: { min: 100, max: 260 },
      lifespan: 700,
      scale: { start: 0.9, end: 0.2 },
      rotate: { min: 0, max: 360 },
      gravityY: 380,
      quantity: 0,
      emitting: false,
    });
    this.starEmitter.setDepth(180);
  }

  resetRun(offenseText?: string): void {
    if (offenseText !== undefined) this.offenseText = offenseText;
    this.runState.reset(this.offenseText);
    this.slowMoFactor = 1;

    this.coworker.setPosition(this.launchOriginPx, this.groundY);
    this.coworker.rotation = 0;
    this.coworker.setScale(1, 1);
    this.coworker.setExpression('smug');

    this.spawner.reset();
    this.cameras.main.scrollX = 0;
    this.parallax.update(this.launchOriginPx);

    this.chargeMeter.setPercent(0);
    this.chargeMeter.setVisible(true);
    this.holdLabel.setVisible(true).setText(UI_LABELS.holdToCharge).setAlpha(GameScene.hasChargedOnce ? 0.55 : 1);
    this.hintText.setVisible(true).setText(UI_LABELS.chargeHint).setAlpha(GameScene.hasChargedOnce ? 0.5 : 1);
    this.countdownText.setVisible(false);
    this.perfectText.setVisible(false);

    this.hud.setDistance(0);
    this.hud.setSpeed(0);
    this.hud.setBoosts(Balance.RAGE_BOOST_COUNT);

    this.scene.resume();
  }

  private handleDown(): void {
    if (this.runState.phase === RunPhase.CHARGE && !this.chargeController.isHeld) {
      this.chargeController.start(this.time.now);
      audioManager.startCharge();
      this.holdLabel.setText('CHARGING...');
      GameScene.hasChargedOnce = true;
    } else if (this.runState.phase === RunPhase.FLIGHT) {
      const applied = FlightPhysics.applyBoost(this.runState, this.time.now);
      if (applied) this.onBoostApplied();
    }
  }

  private handleUp(): void {
    if (this.runState.phase !== RunPhase.CHARGE || !this.chargeController.isHeld) return;
    const pct = this.chargeController.getPercent(this.time.now);
    this.chargeController.stop();
    audioManager.stopCharge();
    this.chargeMeter.setVisible(false);
    this.holdLabel.setVisible(false);
    this.hintText.setVisible(false);
    const perfect = ChargeController.isPerfect(pct);
    this.startCountdown(pct, perfect);
  }

  private onBoostApplied(): void {
    audioManager.playBoost();
    GameScene.hasBoostedOnce = true;
    spawnFloatingText(this, this.coworker.x, this.coworker.y - 50, `${UI_LABELS.rageBoostPrefix}${this.runState.rageBoostsRemaining}`, '#ffcc33');
    this.starEmitter.explode(8, this.coworker.x, this.coworker.y);
    this.cameras.main.shake(100, 0.003);
    this.coworker.setExpression('shocked');
  }

  private startCountdown(chargePct: number, perfect: boolean): void {
    this.runState.phase = RunPhase.COUNTDOWN;
    const steps = ['3', '2', '1', UI_LABELS.yeet];
    let i = 0;
    const showNext = (): void => {
      if (i < steps.length) {
        this.countdownText.setText(steps[i]).setVisible(true).setScale(0.4).setAlpha(1);
        this.tweens.add({ targets: this.countdownText, scale: 1.3, duration: 220, ease: 'Back.Out' });
        i += 1;
        this.time.delayedCall(Balance.COUNTDOWN_STEP_MS, showNext);
      } else {
        this.countdownText.setVisible(false);
        this.doLaunch(chargePct, perfect);
      }
    };
    showNext();
  }

  private doLaunch(chargePct: number, perfect: boolean): void {
    FlightPhysics.launch(this.runState, chargePct, perfect);
    this.runState.phase = RunPhase.FLIGHT;
    this.animator.playLaunchStretch();
    this.coworker.setExpression(perfect ? 'shocked' : 'annoyed');
    audioManager.playLaunch(perfect);
    this.cameras.main.shake(220, perfect ? 0.012 : 0.007);
    this.paperEmitter.explode(20, this.coworker.x, this.coworker.y - 40);

    if (perfect) {
      this.starEmitter.explode(16, this.coworker.x, this.coworker.y);
      this.perfectText.setVisible(true).setScale(0.5).setAlpha(1);
      this.tweens.add({
        targets: this.perfectText,
        scale: 1,
        duration: 250,
        ease: 'Back.Out',
        onComplete: () => {
          this.time.delayedCall(600, () => {
            this.tweens.add({ targets: this.perfectText, alpha: 0, duration: 300, onComplete: () => this.perfectText.setVisible(false) });
          });
        },
      });
      this.slowMoFactor = Balance.PERFECT_SLOWMO_TIMESCALE;
      this.tweens.add({ targets: this, slowMoFactor: 1, duration: Balance.PERFECT_SLOWMO_DURATION_MS, ease: 'Sine.In' });
    }

    this.hintText.setText(UI_LABELS.boostHint).setVisible(true).setAlpha(GameScene.hasBoostedOnce ? 0.5 : 1);
  }

  update(time: number, delta: number): void {
    const dt = (delta / 1000) * this.slowMoFactor;

    switch (this.runState.phase) {
      case RunPhase.CHARGE:
        if (this.chargeController.isHeld) {
          const pct = this.chargeController.getPercent(time);
          this.chargeMeter.setPercent(pct);
          this.animator.playChargeWobble(pct);
          audioManager.updateCharge(pct);
        }
        break;
      case RunPhase.FLIGHT:
        this.updateFlight(dt, time);
        break;
      default:
        break;
    }
  }

  private updateFlight(dt: number, time: number): void {
    const prevDistance = this.runState.distanceFt;
    const result = FlightPhysics.step(this.runState, dt);

    const worldPxX = this.launchOriginPx + this.runState.x * PX_PER_FT;
    const worldPxY = this.groundY - this.runState.y * PX_PER_FT;
    this.coworker.setPosition(worldPxX, worldPxY);
    this.coworker.rotation = this.runState.rotation;

    const cam = this.cameras.main;
    const targetScrollX = Math.max(0, worldPxX - this.scale.width * 0.35);
    cam.scrollX = Phaser.Math.Linear(cam.scrollX, targetScrollX, 0.15);

    this.hud.setDistance(this.runState.distanceFt);
    this.hud.setSpeed(Math.hypot(this.runState.vx, this.runState.vy));
    this.hud.setBoosts(this.runState.rageBoostsRemaining);
    this.parallax.update(worldPxX);

    const crossed = checkMilestones(prevDistance, this.runState.distanceFt, this.runState.firedMilestones);
    if (crossed.length > 0) {
      audioManager.playMilestone();
      this.starEmitter.explode(14, worldPxX, worldPxY - 30);
      crossed.forEach((text) => this.milestoneBanner.showMilestone(text));
    }

    if (time - this.runState.lastCommentaryCheckAt > Balance.COMMENTARY_CHECK_INTERVAL_MS) {
      this.runState.lastCommentaryCheckAt = time;
      if (Math.random() < Balance.COMMENTARY_FIRE_CHANCE) {
        this.milestoneBanner.showCommentary(this.commentaryPicker.pick());
      }
    }

    const speed = Math.hypot(this.runState.vx, this.runState.vy);
    if (speed > 90 && Math.random() < 0.35) this.spawnSpeedLine(worldPxX, worldPxY);

    if (!result.bounced) {
      this.coworker.setExpression(this.runState.vy > 15 ? 'shocked' : 'annoyed');
    }

    const hit = this.spawner.findCollision(worldPxX, worldPxY, 28);
    if (hit) {
      hit.hit = true;
      this.tweens.add({ targets: hit.image, alpha: 0.1, scale: hit.image.scale * 0.7, duration: 200 });
      const { big } = applyObjectEffect(hit.def.kind, this.runState);
      spawnFloatingText(this, worldPxX, worldPxY - 70, hit.def.caption);
      audioManager.playCollision();
      cam.shake(big ? 180 : 100, big ? 0.006 : 0.003);
      if (hit.def.kind === 'PRINTER') this.paperEmitter.explode(24, worldPxX, worldPxY);
      if (hit.def.kind === 'COFFEE_CART' || hit.def.kind === 'REPLY_ALL_ICON') this.starEmitter.explode(10, worldPxX, worldPxY);
    }

    if (result.bounced) {
      audioManager.playBounce(result.bounceIntensity);
      this.animator.playBounceSquash(result.bounceIntensity);
      this.dustEmitter.explode(12, worldPxX, this.groundY);
      cam.shake(120, 0.002 + result.bounceIntensity * 0.005);
      this.coworker.setExpression('dizzy');
    }

    if (result.stopped) {
      this.endRun(worldPxX);
    }
  }

  private spawnSpeedLine(x: number, y: number): void {
    const line = this.add
      .image(x - 40 - Math.random() * 20, y + (Math.random() - 0.5) * 60, 'speed_line')
      .setAlpha(0.6)
      .setScale(0.6 + Math.random() * 0.8)
      .setDepth(60);
    this.tweens.add({
      targets: line,
      x: line.x - 120,
      alpha: 0,
      duration: 350,
      onComplete: () => line.destroy(),
    });
  }

  private endRun(worldPxX: number): void {
    this.runState.phase = RunPhase.ENDED;
    this.coworker.setExpression('dizzy');
    this.animator.playLandingSettle();
    audioManager.playLanding();
    this.dustEmitter.explode(18, worldPxX, this.groundY);
    this.hintText.setVisible(false);

    const finalDistance = this.runState.distanceFt;
    const isNewHigh = Persistence.reportDistance(finalDistance);
    const ragePoints = Math.round(finalDistance * Balance.RAGE_POINTS_PER_FOOT) + this.runState.bonusRagePoints;
    const careerTotal = Persistence.addCareerRage(ragePoints);
    if (isNewHigh) {
      audioManager.playNewHighScore();
      this.hud.flashHighScore();
    }

    this.time.delayedCall(750, () => {
      this.scene.launch('Results', {
        distanceFt: finalDistance,
        offenseText: this.runState.offenseText,
        ragePoints,
        isNewHigh,
        careerTotal,
      });
      this.scene.pause();
    });
  }
}
