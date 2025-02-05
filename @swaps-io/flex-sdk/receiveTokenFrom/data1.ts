import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexReceiveTokenFromData1Params {
  amount: AsHexValue;
}

export function encodeFlexReceiveTokenFromData1(params: EncodeFlexReceiveTokenFromData1Params): Hex {
  return asHex(params.amount, 32);
}
