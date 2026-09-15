export function randRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randInt(min: number, max: number): number {
  return Math.floor(randRange(min, max + 1));
}

export function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Picks a random item while avoiding the last `historySize` picks where possible,
 * so flavor text (offenses/commentary) doesn't repeat back-to-back.
 */
export class NonRepeatingPicker<T> {
  private history: T[] = [];

  constructor(private readonly pool: readonly T[], private readonly historySize = 2) {}

  pick(): T {
    const candidates = this.pool.filter((item) => !this.history.includes(item));
    const source = candidates.length > 0 ? candidates : this.pool;
    const choice = pick(source);
    this.history.push(choice);
    if (this.history.length > this.historySize) this.history.shift();
    return choice;
  }
}

export function weightedPick<T extends { weightPct: number }>(entries: Array<[string, T]>): string {
  const total = entries.reduce((sum, [, v]) => sum + v.weightPct, 0);
  let roll = Math.random() * total;
  for (const [key, v] of entries) {
    roll -= v.weightPct;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1][0];
}
