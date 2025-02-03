import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexRefundNativeData0Params {
  keyHash: AsHexValue;
}

export function encodeFlexRefundNativeData0(params: EncodeFlexRefundNativeData0Params): Hex {
  return asHex(params.keyHash, 32);
}
