// All tunable numbers for feel/balance live here. Physics runs in feet / feet-per-second
// so gameplay math never has to think about pixels; RENDER_SCALE_PX_PER_FT is the only
// place feet get converted to screen pixels.

export const Balance = {
  RENDER_SCALE_PX_PER_FT: 4,

  // Stylized gravity (not the real 32 ft/s^2) so arcs read fast and "cartoon-y".
  GRAVITY_FT_S2: 70,
  LAUNCH_ANGLE_DEG: 45,
  LAUNCH_ANGLE_JITTER_DEG: 3,

  // Calibrated empirically (see README "Balance" section) so a min-charge tap lands in the
  // spec's "bad" band (~300-1000ft) and a perfectly-timed max charge alone (no boosts/objects)
  // reaches the "good" band (~4000-8000ft) - boosts and lucky object chains push further.
  CHARGE_MIN_POWER_FT_S: 120,
  CHARGE_MAX_POWER_FT_S: 400,
  CHARGE_HOLD_TO_MAX_MS: 1600, // time to fill 0->100% if held perfectly steady
  PERFECT_ZONE_MIN_PCT: 92, // charge% at/above this on release = "PERFECT YEET!"
  PERFECT_ZONE_POWER_BONUS_PCT: 15,
  PERFECT_SLOWMO_TIMESCALE: 0.25,
  PERFECT_SLOWMO_DURATION_MS: 500,

  // The meter oscillates so holding "forever" doesn't guarantee 100% - it wobbles near the
  // top and speeds up the longer you hold, so nailing PERFECT takes a well-timed release.
  CHARGE_OSC_AMPLITUDE_PCT: 6,
  CHARGE_OSC_FREQ_HZ_BASE: 1.1,
  CHARGE_OSC_FREQ_HZ_MAX: 2.4,
  CHARGE_OSC_RAMP_START_PCT: 70,

  COUNTDOWN_STEP_MS: 500,

  BOUNCE_RESTITUTION_START: 0.55, // fraction of vertical speed kept on the 1st bounce
  BOUNCE_RESTITUTION_DECAY: 0.82, // multiplies restitution again on each subsequent bounce
  BOUNCE_HORIZONTAL_FRICTION: 0.9, // fraction of horizontal speed kept per bounce
  STOP_SPEED_THRESHOLD_FT_S: 8, // run ends once combined speed drops below this on the ground

  RAGE_BOOST_COUNT: 3,
  RAGE_BOOST_FORWARD_FT_S: 55,
  RAGE_BOOST_UPWARD_FT_S: 40,
  RAGE_BOOST_COOLDOWN_MS: 250,

  RAGE_POINTS_PER_FOOT: 0.1, // ~1 point per 10 ft

  ZONE_THRESHOLDS_FT: {
    OFFICE: 0,
    PARKING_LOT: 500,
    CITY: 1500,
    COUNTRYSIDE: 4000,
    CLOUDS: 8000,
    SPACE: 15000,
  },

  MILESTONES_FT: [500, 1500, 4000, 8000, 15000] as const,

  DESTINATION_BUCKETS_FT: [
    { max: 300, name: 'BREAK ROOM' },
    { max: 750, name: 'PARKING LOT' },
    { max: 1500, name: 'REGIONAL OFFICE' },
    { max: 3000, name: "COMPETITOR'S HEADQUARTERS" },
    { max: 5000, name: 'ANOTHER ZIP CODE' },
    { max: 8000, name: 'HR CONFERENCE' },
    { max: 15000, name: 'INTERNATIONAL WATERS' },
    { max: 30000, name: 'LOW EARTH ORBIT' },
    { max: Infinity, name: 'FINALLY FAR ENOUGH AWAY' },
  ],

  OBJECT_EFFECTS: {
    COFFEE_CART: { forwardBoostFtMin: 150, forwardBoostFtMax: 300, caption: 'CAFFEINATED!', weightPct: 22 },
    PRINTER: { verticalImpulseFtS: 70, caption: 'PAPER JAM!', weightPct: 22 },
    MAIL_CART: { horizontalImpulseFtS: 60, caption: 'EXPRESS DELIVERY!', weightPct: 20 },
    INDUSTRIAL_FAN: { upwardImpulseFtS: 50, caption: 'CIRCLE BACK!', weightPct: 18 },
    REPLY_ALL_ICON: { horizontalImpulseFtS: 35, caption: 'REPLY ALL RAGE +100', weightPct: 13 },
    HR_COUCH: { velocityRetainedPct: 15, caption: 'MANDATORY DEBRIEF', weightPct: 5 },
  },

  SPAWN_MIN_GAP_FT: 150,
  SPAWN_MAX_GAP_FT: 400,
  SPAWN_START_FT: 120, // no objects immediately under the launch point

  COMMENTARY_CHECK_INTERVAL_MS: 4500,
  COMMENTARY_FIRE_CHANCE: 0.35,
} as const;

export type ObjectKind = keyof typeof Balance.OBJECT_EFFECTS;
