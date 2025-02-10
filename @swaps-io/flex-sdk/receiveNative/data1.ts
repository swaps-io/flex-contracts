import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeReceiveNativeData1Params {
  amount: AsHexValue;
}

export function flexEncodeReceiveNativeData1(params: FlexEncodeReceiveNativeData1Params): Hex {
  return asHex(params.amount, 32);
}
