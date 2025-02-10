import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeRefundNativeData0Params {
  keyHash: AsHexValue;
}

export function flexEncodeRefundNativeData0(params: FlexEncodeRefundNativeData0Params): Hex {
  return asHex(params.keyHash, 32);
}
