import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeRefundTokenData2Params {
  receiveTokenHash: AsHexValue;
}

export function flexEncodeRefundTokenData2(params: FlexEncodeRefundTokenData2Params): Hex {
  return asHex(params.receiveTokenHash, 32);
}
