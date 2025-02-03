import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexRefundNativeData1Params {
  receiver: AsHexValue;
}

export function encodeFlexRefundNativeData1(params: EncodeFlexRefundNativeData1Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.receiver, 20),
  ]);
}
