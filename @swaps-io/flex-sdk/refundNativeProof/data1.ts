import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexRefundNativeProofData1Params {
  eventChain: AsHexValue;
}

export function encodeFlexRefundNativeProofData1(params: EncodeFlexRefundNativeProofData1Params): Hex {
  return asHex(params.eventChain, 32);
}
