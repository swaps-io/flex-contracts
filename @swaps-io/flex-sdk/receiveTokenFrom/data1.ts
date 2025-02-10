import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeReceiveTokenFromData1Params {
  amount: AsHexValue;
}

export function flexEncodeReceiveTokenFromData1(params: FlexEncodeReceiveTokenFromData1Params): Hex {
  return asHex(params.amount, 32);
}
