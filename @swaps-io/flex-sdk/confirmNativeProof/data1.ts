import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexConfirmNativeProofData1Params {
  eventChain: AsHexValue;
}

export function encodeFlexConfirmNativeProofData1(params: EncodeFlexConfirmNativeProofData1Params): Hex {
  return asHex(params.eventChain, 32);
}
