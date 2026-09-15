const KEYS = {
  highScore: 'shf_highScore',
  careerRage: 'shf_careerRage',
  soundOn: 'shf_soundOn',
  lastOffense: 'shf_lastOffense',
} as const;

function readNumber(key: string, fallback: number): number {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export const Persistence = {
  getHighScore(): number {
    return readNumber(KEYS.highScore, 0);
  },
  /** Returns true if this distance set a new high score. */
  reportDistance(distanceFt: number): boolean {
    const current = this.getHighScore();
    if (distanceFt > current) {
      localStorage.setItem(KEYS.highScore, String(Math.round(distanceFt)));
      return true;
    }
    return false;
  },

  getCareerRage(): number {
    return readNumber(KEYS.careerRage, 0);
  },
  addCareerRage(points: number): number {
    const total = this.getCareerRage() + Math.round(points);
    localStorage.setItem(KEYS.careerRage, String(total));
    return total;
  },

  isSoundOn(): boolean {
    const raw = localStorage.getItem(KEYS.soundOn);
    return raw === null ? true : raw === '1';
  },
  setSoundOn(on: boolean): void {
    localStorage.setItem(KEYS.soundOn, on ? '1' : '0');
  },

  getLastOffense(): string {
    return localStorage.getItem(KEYS.lastOffense) ?? '';
  },
  setLastOffense(text: string): void {
    localStorage.setItem(KEYS.lastOffense, text);
  },
};
