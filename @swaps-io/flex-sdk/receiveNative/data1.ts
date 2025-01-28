import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexReceiveNativeData1Params {
  amount: AsHexValue;
}

export function encodeFlexReceiveNativeData1(params: EncodeFlexReceiveNativeData1Params): Hex {
  return asHex(params.amount, 32);
}
