import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexRefundTokenProofData3Params {
  receiveTokenHash: AsHexValue;
}

export function encodeFlexRefundTokenProofData3(params: EncodeFlexRefundTokenProofData3Params): Hex {
  return asHex(params.receiveTokenHash, 32);
}
