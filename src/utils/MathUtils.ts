export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

export function formatFeet(feet: number): string {
  return `${Math.round(feet).toLocaleString('en-US')} FT`;
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}
