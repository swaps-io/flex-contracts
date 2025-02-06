import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexConfirmNativeData1Params {
  receiveNativeHash: AsHexValue;
}

export function encodeFlexConfirmNativeData1(params: EncodeFlexConfirmNativeData1Params): Hex {
  return asHex(params.receiveNativeHash, 32);
}
