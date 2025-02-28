import { asHex, AsHexValue, concatHex, Hex, sliceHex } from '../external';

import { flexCalcAccumulatorHash } from '../accumulator';

export interface FlexEncodeSendAccumulatorDataParams {
  orderHash: AsHexValue;
  start: AsHexValue;
}

export function flexEncodeSendAccumulatorData({ orderHash, start }: FlexEncodeSendAccumulatorDataParams): Hex {
  return concatHex([
    sliceHex(asHex(orderHash, 32), 0, 26),
    asHex(start, 6),
  ]);
}

export interface FlexCalcSendAccumulatorHashParams {
  hashBefore: AsHexValue;
  orderHash: AsHexValue;
  start: AsHexValue;
}

export function flexCalcSendAccumulatorHash({ hashBefore, orderHash, start }: FlexCalcSendAccumulatorHashParams): Hex {
  const hashToAdd = flexEncodeSendAccumulatorData({ orderHash, start });
  return flexCalcAccumulatorHash({ hashBefore, hashToAdd });
}
