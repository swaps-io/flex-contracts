import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexSendTokenData2Params {
  amount: AsHexValue;
}

export function encodeFlexSendTokenData2(params: EncodeFlexSendTokenData2Params): Hex {
  return asHex(params.amount, 32);
}
