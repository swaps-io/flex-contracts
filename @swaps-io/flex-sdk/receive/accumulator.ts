import { asHex, AsHexValue, Hex } from '../external';

import { flexCalcAccumulatorHash } from '../accumulator';

export interface FlexEncodeReceiveAccumulatorHashParams {
  orderHash: AsHexValue;
}

export function flexEncodeReceiveAccumulatorHash({ orderHash }: FlexEncodeReceiveAccumulatorHashParams): Hex {
  return asHex(orderHash, 32);
}

export interface FlexCalcReceiveAccumulatorHashParams {
  hashBefore: AsHexValue;
  orderHash: AsHexValue;
}

export function flexCalcReceiveAccumulatorHash({ hashBefore, orderHash }: FlexCalcReceiveAccumulatorHashParams): Hex {
  const hashToAdd = flexEncodeReceiveAccumulatorHash({ orderHash });
  return flexCalcAccumulatorHash({ hashBefore, hashToAdd });
}
