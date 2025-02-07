import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexConfirmNativeProofData2Params {
  receiveNativeHash: AsHexValue;
}

export function encodeFlexConfirmNativeProofData2(params: EncodeFlexConfirmNativeProofData2Params): Hex {
  return asHex(params.receiveNativeHash, 32);
}
