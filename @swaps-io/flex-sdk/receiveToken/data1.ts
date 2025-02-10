import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeReceiveTokenData1Params {
  amount: AsHexValue;
}

export function flexEncodeReceiveTokenData1(params: FlexEncodeReceiveTokenData1Params): Hex {
  return asHex(params.amount, 32);
}
