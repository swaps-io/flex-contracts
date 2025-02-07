import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexRefundNativeProofData0Params {
  eventSignature: AsHexValue;
}

export function encodeFlexRefundNativeProofData0(params: EncodeFlexRefundNativeProofData0Params): Hex {
  return asHex(params.eventSignature, 32);
}
