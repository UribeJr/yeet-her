# SEND HER FLYING

*For meetings that should've been emails.*

[**Play Yeet Her →**](https://yeet-her.vercel.app)

A ridiculous, cathartic office-satire distance-launch arcade game. Launch an
annoying cartoon coworker in a rolling office chair and see how far you can
send her — office, parking lot, city, countryside, clouds, and (if you're
good/lucky) space.

Everything is drawn procedurally at runtime (Phaser `Graphics` baked into
textures) and all sound is synthesized with the Web Audio API — there are no
image or audio assets, no external API keys, no backend, and no accounts.

## Run it

```bash
npm install
npm run dev       # starts a local dev server (opens automatically)
```

Other scripts:

```bash
npm run typecheck # tsc --noEmit
npm run build     # typecheck + production build to dist/
npm run preview   # serve the production build locally
```

High score, career Rage Points, and the sound on/off setting persist in the
browser's `localStorage` — no account, no server.

## Controls

- **Hold** (mouse / touch / spacebar) to charge the launch meter. The meter
  wobbles and speeds up near the top, so a **PERFECT YEET!** takes a
  well-timed release, not just "hold as long as possible."
- **Release** to fire the 3-2-1-YEET countdown and launch.
- While airborne, **tap / click / spacebar** fires a **Rage Boost** (3 per
  run) — a small forward+upward impulse. Timing it off a bounce or before a
  milestone can add meaningful distance.
- Bounce off the ground and fly through interactive objects (coffee cart,
  printer, mail cart, industrial fan, Reply-All icon, HR couch) for
  distance swings, good and bad.

## Project structure

```
src/
├── main.ts                    Phaser.Game bootstrap
├── config/                    GameConfig (scale/render), Balance (tunables), Colors (palette)
├── content/strings.ts         Offenses, commentary, milestone text, destination names, UI labels
├── state/                     Persistence (localStorage), RunState (per-run transient state)
├── entities/                  Coworker (character+chair Container), CoworkerAnimator (squash/stretch)
├── physics/                   FlightPhysics (gravity/bounce), ChargeController (charge meter)
├── world/                     TextureFactory (all procedural art), ZoneManager, ParallaxManager
├── objects/                   ObjectDefs, Interactable, InteractableSpawner (the 6 hittable objects)
├── ui/                        Button, ChargeMeter, HUD, MilestoneBanner, FloatingText, TextInputOverlay
├── input/InputManager.ts      Unifies mouse/touch/spacebar into one down/up API
├── audio/AudioManager.ts      Procedural Web Audio SFX (no audio files)
└── scenes/                    Boot, Preload, Title, HowToPlay, PreLaunch, Game, ResultsOverlay
```

`GameScene` owns the whole charge → countdown → flight → landing loop as one
internal state machine (see `RunPhase` in `state/RunState.ts`) rather than as
separate Phaser Scenes, so restarting a run (`GameScene.resetRun()`) is
instant — no scene teardown/rebuild, no flicker. `ResultsOverlayScene` is a
thin, stateless UI panel launched additively on top of the paused `GameScene`.

## Tweaking the feel

Nearly every gameplay constant lives in one file: **`src/config/Balance.ts`**.
The ones most worth playing with first:

| Constant | Effect |
|---|---|
| `GRAVITY_FT_S2` | Lower = floatier, longer arcs. Higher = snappier, shorter hops. |
| `CHARGE_MIN_POWER_FT_S` / `CHARGE_MAX_POWER_FT_S` | Launch speed range from a 0% vs. 100% charge. This is the single biggest lever on overall distance. |
| `CHARGE_HOLD_TO_MAX_MS` | How long a hold takes to ramp the charge meter up. |
| `CHARGE_OSC_AMPLITUDE_PCT` / `CHARGE_OSC_FREQ_HZ_BASE` / `_MAX` | How much the charge meter wobbles and how fast — the skill knob for landing a PERFECT YEET. |
| `PERFECT_ZONE_MIN_PCT` / `PERFECT_ZONE_POWER_BONUS_PCT` | Charge % needed for "PERFECT YEET!" and its power bonus. |
| `BOUNCE_RESTITUTION_START` / `BOUNCE_RESTITUTION_DECAY` | How bouncy the landing is and how fast bounces die out. |
| `STOP_SPEED_THRESHOLD_FT_S` | Speed below which a run is declared over. |
| `RAGE_BOOST_FORWARD_FT_S` / `RAGE_BOOST_UPWARD_FT_S` | Punch of each mid-air Rage Boost. |
| `OBJECT_EFFECTS` | Per-object impulse/bonus magnitudes (coffee cart, printer, mail cart, fan, reply-all, HR couch) and their spawn `weightPct`. |
| `ZONE_THRESHOLDS_FT` / `DESTINATION_BUCKETS_FT` | Distance bands for background zones and the results-screen "destination" name. |

Current balance targets (tuned by empirically sampling many charge/hold
durations, see the constants above): a minimal/accidental tap lands around
300-1000 ft, a solid mid-charge lands in the 1500-4000 ft range, and a
perfectly-timed max charge alone (no boosts or lucky object hits) reaches
roughly 5000-7000 ft. Rage Boosts and interactive objects are what push a
good run into the 8000-15000+ ft "excellent" territory, and rare, near-ideal
combinations can reach "space" (15000+ ft).

Visual/scale note: physics is computed entirely in feet/feet-per-second;
`RENDER_SCALE_PX_PER_FT` (also in `Balance.ts`) is the only place that gets
converted to screen pixels, so changing it rescales the whole world's zoom
level without touching any gameplay math.

## Browser support

Desktop (mouse + spacebar) and mobile (touch) are both first-class inputs,
unified through `src/input/InputManager.ts`. The canvas uses Phaser's
`Scale.FIT` mode against a fixed 1280×720 logical resolution, so it letterboxes
cleanly at any window size instead of reflowing UI.
