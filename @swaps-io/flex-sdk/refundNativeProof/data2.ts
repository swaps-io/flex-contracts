import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexRefundNativeProofData2Params {
  receiver: AsHexValue;
}

export function encodeFlexRefundNativeProofData2(params: EncodeFlexRefundNativeProofData2Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.receiver, 20),
  ]);
}
