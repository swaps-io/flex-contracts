import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeSendTokenData2Params {
  amount: AsHexValue;
}

export function flexEncodeSendTokenData2(params: FlexEncodeSendTokenData2Params): Hex {
  return asHex(params.amount, 32);
}
