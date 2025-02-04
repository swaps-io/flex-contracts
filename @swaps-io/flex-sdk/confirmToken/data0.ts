import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexConfirmTokenData0Params {
  keyHash: AsHexValue;
}

export function encodeFlexConfirmTokenData0(params: EncodeFlexConfirmTokenData0Params): Hex {
  return asHex(params.keyHash, 32);
}
