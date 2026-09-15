// All player-facing flavor text lives here so tone/copy can be tuned in one place.

// Note: no double quotes inside these - callers wrap the whole string in "quotes"
// already, so any inner quoting here uses single quotes to avoid a doubled-up look.
export const OFFENSES: string[] = [
  'Scheduled a 4:30 PM meeting',
  "Said 'per my last email'",
  'Replied all',
  "Asked for a 'quick favor'",
  'Added another meeting',
  "Said 'let's circle back'",
  'Stole the good parking spot',
  'Changed the spreadsheet again',
];

export const COMMENTARY: string[] = [
  "SHE'S STILL GOING",
  'PER MY LAST YEET...',
  'PLEASE ADVISE',
  'CIRCLING BACK',
  'OUT OF OFFICE',
  'SYNERGY!',
  'THIS MEETING HAS BEEN CANCELLED',
  'PLEASE REMOVE ME FROM THIS EMAIL',
  'QUICK QUESTION DENIED',
];

// Keyed by the exact feet threshold so GameScene can do a simple lookup as it crosses each one.
export const MILESTONES: Record<number, string> = {
  500: 'ESCAPED THE OFFICE',
  1500: 'LEFT THE PARKING LOT',
  4000: 'DIFFERENT ZIP CODE',
  8000: 'AIRSPACE VIOLATION',
  15000: 'ORBITAL COWORKER',
};

export const UI_LABELS = {
  title: 'SEND HER FLYING',
  subtitle: "For meetings that should've been emails.",
  play: 'PLAY',
  howToPlay: 'HOW TO PLAY',
  soundOn: 'SOUND: ON',
  soundOff: 'SOUND: OFF',
  offensePrompt: 'WHAT DID SHE DO THIS TIME?',
  offensePlaceholder: 'Scheduled another pointless meeting...',
  todaysOffense: "TODAY'S OFFENSE",
  recommendedSentence: 'RECOMMENDED SENTENCE: MAXIMUM YEET',
  ready: 'READY',
  holdToCharge: 'HOLD TO CHARGE',
  perfectYeet: 'PERFECT YEET!',
  yeet: 'YEET!',
  rageBoostPrefix: 'RAGE BOOST x',
  distance: 'DISTANCE',
  destination: 'DESTINATION',
  ragePoints: 'RAGE POINTS',
  newPersonalBest: 'NEW PERSONAL BEST!',
  yeetAgain: 'YEET AGAIN',
  changeOffense: 'CHANGE OFFENSE',
  careerRage: 'TOTAL CAREER RAGE',
  highScore: 'HIGH SCORE',
  chargeHint: 'HOLD (SPACE / CLICK / TAP) TO CHARGE',
  boostHint: 'TAP / CLICK / SPACE TO RAGE BOOST',
} as const;
