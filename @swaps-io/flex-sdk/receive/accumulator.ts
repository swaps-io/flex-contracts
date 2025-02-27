import { Hex } from '../external';

import { flexCalcAccumulatorHash } from '../accumulator';

export interface FlexCalcReceiveAccumulatorHashParams {
  hashBefore: Hex,
  orderHash: Hex,
}

export function flexCalcReceiveAccumulatorHash({ hashBefore, orderHash }: FlexCalcReceiveAccumulatorHashParams): Hex {
  return flexCalcAccumulatorHash({ hashBefore, hashToAdd: orderHash });
}
