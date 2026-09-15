import { Balance } from '../config/Balance';
import { clamp, lerp } from '../utils/MathUtils';

/**
 * Drives the charge meter while the player holds. The base value ramps up but caps
 * below 100, and an oscillation (which speeds up over time) rides on top of it - so
 * reaching the PERFECT zone requires releasing right as the wave crests, not just
 * "holding as long as possible".
 */
export class ChargeController {
  private startedAt = 0;
  private held = false;

  start(nowMs: number): void {
    this.startedAt = nowMs;
    this.held = true;
  }

  stop(): void {
    this.held = false;
  }

  get isHeld(): boolean {
    return this.held;
  }

  /** Returns current charge percent (0-100) for the given time. */
  getPercent(nowMs: number): number {
    const elapsed = nowMs - this.startedAt;
    const rampT = clamp(elapsed / Balance.CHARGE_HOLD_TO_MAX_MS, 0, 1);
    const base = lerp(0, 85, rampT); // base caps at 85% - the top only reachable via the wave

    const oscStartT = Balance.CHARGE_OSC_RAMP_START_PCT / 85;
    const oscT = clamp((rampT - oscStartT) / (1 - oscStartT), 0, 1);
    const freqHz = lerp(Balance.CHARGE_OSC_FREQ_HZ_BASE, Balance.CHARGE_OSC_FREQ_HZ_MAX, oscT);
    const amplitude = base > Balance.CHARGE_OSC_RAMP_START_PCT ? Balance.CHARGE_OSC_AMPLITUDE_PCT : Balance.CHARGE_OSC_AMPLITUDE_PCT * 0.3;

    const wave = Math.sin(2 * Math.PI * freqHz * (elapsed / 1000)) * amplitude;
    return clamp(base + wave, 0, 100);
  }

  static isPerfect(pct: number): boolean {
    return pct >= Balance.PERFECT_ZONE_MIN_PCT;
  }
}
