import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexSendNativeData2Params {
  amount: AsHexValue;
}

export function encodeFlexSendNativeData2(params: EncodeFlexSendNativeData2Params): Hex {
  return asHex(params.amount, 32);
}
