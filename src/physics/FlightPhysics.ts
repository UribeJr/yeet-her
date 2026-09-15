import { Balance } from '../config/Balance';
import { RunState } from '../state/RunState';
import { randRange } from '../utils/Random';

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export interface StepResult {
  bounced: boolean;
  bounceIntensity: number; // 0..1, roughly how hard - drives squash amount / shake / sound volume
  stopped: boolean;
}

/**
 * Pure arcade-physics helpers operating on RunState. Everything is feet / feet-per-second;
 * GameScene is the only place this gets multiplied by RENDER_SCALE_PX_PER_FT for drawing.
 */
export const FlightPhysics = {
  launch(state: RunState, chargePct: number, perfect: boolean): void {
    const basePower = Balance.CHARGE_MIN_POWER_FT_S + (Balance.CHARGE_MAX_POWER_FT_S - Balance.CHARGE_MIN_POWER_FT_S) * (chargePct / 100);
    const power = perfect ? basePower * (1 + Balance.PERFECT_ZONE_POWER_BONUS_PCT / 100) : basePower;

    const angleDeg = Balance.LAUNCH_ANGLE_DEG + randRange(-Balance.LAUNCH_ANGLE_JITTER_DEG, Balance.LAUNCH_ANGLE_JITTER_DEG);
    const angleRad = degToRad(angleDeg);

    state.vx = Math.cos(angleRad) * power;
    state.vy = Math.sin(angleRad) * power;
    state.angularVelocity = -randRange(2.5, 4.5); // tumble forward
    state.hasLaunched = true;
    state.wasPerfectLaunch = perfect;
    state.y = 0;
    state.x = 0;
    state.bounceCount = 0;
  },

  applyBoost(state: RunState, nowMs: number): boolean {
    if (state.rageBoostsRemaining <= 0) return false;
    if (nowMs - state.lastBoostAt < Balance.RAGE_BOOST_COOLDOWN_MS) return false;
    state.vx += Balance.RAGE_BOOST_FORWARD_FT_S;
    state.vy += Balance.RAGE_BOOST_UPWARD_FT_S;
    state.angularVelocity -= 1.5;
    state.rageBoostsRemaining -= 1;
    state.lastBoostAt = nowMs;
    return true;
  },

  /** Integrates one physics tick. Returns what happened so GameScene can trigger juice. */
  step(state: RunState, dt: number): StepResult {
    state.vy -= Balance.GRAVITY_FT_S2 * dt;
    state.x += state.vx * dt;
    state.y += state.vy * dt;
    state.rotation += state.angularVelocity * dt;

    state.distanceFt = Math.max(0, state.x);
    state.maxDistanceFt = Math.max(state.maxDistanceFt, state.distanceFt);

    let bounced = false;
    let bounceIntensity = 0;
    let stopped = false;

    if (state.y <= 0 && state.vy < 0) {
      state.y = 0;
      const impactSpeed = Math.abs(state.vy);
      const restitution = Balance.BOUNCE_RESTITUTION_START * Math.pow(Balance.BOUNCE_RESTITUTION_DECAY, state.bounceCount);
      state.vy = impactSpeed * restitution;
      state.vx *= Balance.BOUNCE_HORIZONTAL_FRICTION;
      state.angularVelocity *= 0.6;
      state.bounceCount += 1;
      bounced = true;
      bounceIntensity = Math.min(1, impactSpeed / Balance.CHARGE_MAX_POWER_FT_S);

      const speed = Math.hypot(state.vx, state.vy);
      if (speed < Balance.STOP_SPEED_THRESHOLD_FT_S) {
        stopped = true;
        state.vx = 0;
        state.vy = 0;
        state.angularVelocity = 0;
      }
    }

    return { bounced, bounceIntensity, stopped };
  },
};
