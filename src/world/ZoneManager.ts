import { Balance } from '../config/Balance';
import { MILESTONES } from '../content/strings';

export enum Zone {
  OFFICE = 'OFFICE',
  PARKING_LOT = 'PARKING_LOT',
  CITY = 'CITY',
  COUNTRYSIDE = 'COUNTRYSIDE',
  CLOUDS = 'CLOUDS',
  SPACE = 'SPACE',
}

const ZONE_ORDER: Array<{ zone: Zone; startFt: number }> = [
  { zone: Zone.OFFICE, startFt: Balance.ZONE_THRESHOLDS_FT.OFFICE },
  { zone: Zone.PARKING_LOT, startFt: Balance.ZONE_THRESHOLDS_FT.PARKING_LOT },
  { zone: Zone.CITY, startFt: Balance.ZONE_THRESHOLDS_FT.CITY },
  { zone: Zone.COUNTRYSIDE, startFt: Balance.ZONE_THRESHOLDS_FT.COUNTRYSIDE },
  { zone: Zone.CLOUDS, startFt: Balance.ZONE_THRESHOLDS_FT.CLOUDS },
  { zone: Zone.SPACE, startFt: Balance.ZONE_THRESHOLDS_FT.SPACE },
];

export function getZoneForDistance(distanceFt: number): Zone {
  let current = ZONE_ORDER[0].zone;
  for (const entry of ZONE_ORDER) {
    if (distanceFt >= entry.startFt) current = entry.zone;
  }
  return current;
}

/** Returns milestone caption strings ("500 FT — ESCAPED THE OFFICE") crossed between two distances. */
export function checkMilestones(prevFt: number, currFt: number, fired: Set<number>): string[] {
  const captions: string[] = [];
  for (const threshold of Balance.MILESTONES_FT) {
    if (fired.has(threshold)) continue;
    if (prevFt < threshold && currFt >= threshold) {
      fired.add(threshold);
      captions.push(`${threshold.toLocaleString('en-US')} FT — ${MILESTONES[threshold]}`);
    }
  }
  return captions;
}

export function getDestinationName(distanceFt: number): string {
  const bucket = Balance.DESTINATION_BUCKETS_FT.find((b) => distanceFt <= b.max);
  return bucket ? bucket.name : Balance.DESTINATION_BUCKETS_FT[Balance.DESTINATION_BUCKETS_FT.length - 1].name;
}
