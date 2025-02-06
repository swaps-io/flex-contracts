import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexRefundTokenData2Params {
  receiveTokenHash: AsHexValue;
}

export function encodeFlexRefundTokenData2(params: EncodeFlexRefundTokenData2Params): Hex {
  return asHex(params.receiveTokenHash, 32);
}
