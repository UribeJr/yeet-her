import { Balance, ObjectKind } from '../config/Balance';
import { RunState } from '../state/RunState';
import { randRange } from '../utils/Random';

export interface ObjectDef {
  kind: ObjectKind;
  textureKey: string;
  caption: string;
  weightPct: number;
  width: number;
  height: number;
}

export const OBJECT_DEFS: Record<ObjectKind, ObjectDef> = {
  COFFEE_CART: {
    kind: 'COFFEE_CART',
    textureKey: 'prop_coffee',
    caption: Balance.OBJECT_EFFECTS.COFFEE_CART.caption,
    weightPct: Balance.OBJECT_EFFECTS.COFFEE_CART.weightPct,
    width: 20,
    height: 26,
  },
  PRINTER: {
    kind: 'PRINTER',
    textureKey: 'prop_printer',
    caption: Balance.OBJECT_EFFECTS.PRINTER.caption,
    weightPct: Balance.OBJECT_EFFECTS.PRINTER.weightPct,
    width: 34,
    height: 26,
  },
  MAIL_CART: {
    kind: 'MAIL_CART',
    textureKey: 'obj_mailcart',
    caption: Balance.OBJECT_EFFECTS.MAIL_CART.caption,
    weightPct: Balance.OBJECT_EFFECTS.MAIL_CART.weightPct,
    width: 60,
    height: 42,
  },
  INDUSTRIAL_FAN: {
    kind: 'INDUSTRIAL_FAN',
    textureKey: 'obj_fan',
    caption: Balance.OBJECT_EFFECTS.INDUSTRIAL_FAN.caption,
    weightPct: Balance.OBJECT_EFFECTS.INDUSTRIAL_FAN.weightPct,
    width: 56,
    height: 56,
  },
  REPLY_ALL_ICON: {
    kind: 'REPLY_ALL_ICON',
    textureKey: 'obj_replyall',
    caption: Balance.OBJECT_EFFECTS.REPLY_ALL_ICON.caption,
    weightPct: Balance.OBJECT_EFFECTS.REPLY_ALL_ICON.weightPct,
    width: 40,
    height: 32,
  },
  HR_COUCH: {
    kind: 'HR_COUCH',
    textureKey: 'obj_couch',
    caption: Balance.OBJECT_EFFECTS.HR_COUCH.caption,
    weightPct: Balance.OBJECT_EFFECTS.HR_COUCH.weightPct,
    width: 110,
    height: 56,
  },
};

/** Mutates RunState's velocity/distance per the object hit. Returns whether this hit is a "big" moment (bigger juice). */
export function applyObjectEffect(kind: ObjectKind, runState: RunState): { big: boolean } {
  switch (kind) {
    case 'COFFEE_CART': {
      const fx = Balance.OBJECT_EFFECTS.COFFEE_CART;
      const bonus = randRange(fx.forwardBoostFtMin, fx.forwardBoostFtMax);
      runState.x += bonus;
      runState.vx += 12;
      runState.vy = Math.max(runState.vy, 10);
      return { big: true };
    }
    case 'PRINTER':
      runState.vy += Balance.OBJECT_EFFECTS.PRINTER.verticalImpulseFtS;
      return { big: true };
    case 'MAIL_CART':
      runState.vx += Balance.OBJECT_EFFECTS.MAIL_CART.horizontalImpulseFtS;
      return { big: false };
    case 'INDUSTRIAL_FAN':
      runState.vy += Balance.OBJECT_EFFECTS.INDUSTRIAL_FAN.upwardImpulseFtS;
      return { big: false };
    case 'REPLY_ALL_ICON':
      runState.vx += Balance.OBJECT_EFFECTS.REPLY_ALL_ICON.horizontalImpulseFtS;
      runState.bonusRagePoints += 100;
      return { big: false };
    case 'HR_COUCH':
      runState.vx *= Balance.OBJECT_EFFECTS.HR_COUCH.velocityRetainedPct / 100;
      runState.vy = -Math.abs(runState.vy) * 0.1;
      return { big: true };
    default:
      return { big: false };
  }
}
