import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexRefundTokenProofData2Params {
  receiver: AsHexValue;
}

export function encodeFlexRefundTokenProofData2(params: EncodeFlexRefundTokenProofData2Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.receiver, 20),
  ]);
}
