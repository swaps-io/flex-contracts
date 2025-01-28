import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexConfirmNativeData0Params {
  keyHash: AsHexValue;
}

export function encodeFlexConfirmNativeData0(params: EncodeFlexConfirmNativeData0Params): Hex {
  return asHex(params.keyHash, 32);
}
