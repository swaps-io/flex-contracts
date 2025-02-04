import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexRefundTokenData0Params {
  keyHash: AsHexValue;
}

export function encodeFlexRefundTokenData0(params: EncodeFlexRefundTokenData0Params): Hex {
  return asHex(params.keyHash, 32);
}
