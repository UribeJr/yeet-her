import { Balance } from '../config/Balance';

export enum RunPhase {
  CHARGE = 'CHARGE',
  COUNTDOWN = 'COUNTDOWN',
  FLIGHT = 'FLIGHT',
  ENDED = 'ENDED',
}

/** All transient per-run data. Reset wholesale by GameScene.resetRun(). */
export class RunState {
  phase: RunPhase = RunPhase.CHARGE;

  offenseText = '';

  // Physics (feet, feet/s)
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  rotation = 0;
  angularVelocity = 0;
  bounceCount = 0;
  distanceFt = 0;
  maxDistanceFt = 0;
  hasLaunched = false;
  wasPerfectLaunch = false;

  rageBoostsRemaining = Balance.RAGE_BOOST_COUNT;
  lastBoostAt = -Infinity;
  bonusRagePoints = 0;

  firedMilestones = new Set<number>();
  lastCommentaryCheckAt = 0;

  reset(offenseText: string): void {
    this.phase = RunPhase.CHARGE;
    this.offenseText = offenseText;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
    this.angularVelocity = 0;
    this.bounceCount = 0;
    this.distanceFt = 0;
    this.maxDistanceFt = 0;
    this.hasLaunched = false;
    this.wasPerfectLaunch = false;
    this.rageBoostsRemaining = Balance.RAGE_BOOST_COUNT;
    this.lastBoostAt = -Infinity;
    this.bonusRagePoints = 0;
    this.firedMilestones.clear();
    this.lastCommentaryCheckAt = 0;
  }
}
