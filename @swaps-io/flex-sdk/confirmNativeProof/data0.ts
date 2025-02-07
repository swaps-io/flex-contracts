import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexConfirmNativeProofData0Params {
  eventSignature: AsHexValue;
}

export function encodeFlexConfirmNativeProofData0(params: EncodeFlexConfirmNativeProofData0Params): Hex {
  return asHex(params.eventSignature, 32);
}
