import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexRefundNativeProofData3Params {
  receiveNativeHash: AsHexValue;
}

export function encodeFlexRefundNativeProofData3(params: EncodeFlexRefundNativeProofData3Params): Hex {
  return asHex(params.receiveNativeHash, 32);
}
