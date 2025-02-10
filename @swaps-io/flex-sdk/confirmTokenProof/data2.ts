import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexConfirmTokenProofData2Params {
  receiveTokenHash: AsHexValue;
}

export function encodeFlexConfirmTokenProofData2(params: EncodeFlexConfirmTokenProofData2Params): Hex {
  return asHex(params.receiveTokenHash, 32);
}
