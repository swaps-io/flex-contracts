import { asHex, AsHexValue, concatHex, Hex, sliceHex } from '../external';

import { flexCalcAccumulatorHash } from '../accumulator';

export interface FlexCalcSendAccumulatorHashParams {
  hashBefore: Hex,
  orderHash: Hex,
  start: AsHexValue,
}

export function flexCalcSendAccumulatorHash({ hashBefore, orderHash, start }: FlexCalcSendAccumulatorHashParams): Hex {
  const hashToAdd = concatHex([
    sliceHex(orderHash, 0, 26),
    asHex(start, 6),
  ]);
  return flexCalcAccumulatorHash({ hashBefore, hashToAdd });
}
