import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexRefundNativeData2Params {
  receiveNativeHash: AsHexValue;
}

export function encodeFlexRefundNativeData2(params: EncodeFlexRefundNativeData2Params): Hex {
  return asHex(params.receiveNativeHash, 32);
}
