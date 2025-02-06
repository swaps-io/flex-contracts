import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexConfirmTokenData1Params {
  receiveTokenHash: AsHexValue;
}

export function encodeFlexConfirmTokenData1(params: EncodeFlexConfirmTokenData1Params): Hex {
  return asHex(params.receiveTokenHash, 32);
}
