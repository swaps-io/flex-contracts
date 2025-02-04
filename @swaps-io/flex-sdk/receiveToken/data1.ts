import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexReceiveTokenData1Params {
  amount: AsHexValue;
}

export function encodeFlexReceiveTokenData1(params: EncodeFlexReceiveTokenData1Params): Hex {
  return asHex(params.amount, 32);
}
