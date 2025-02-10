import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeRefundTokenProofData3Params {
  receiveTokenHash: AsHexValue;
}

export function flexEncodeRefundTokenProofData3(params: FlexEncodeRefundTokenProofData3Params): Hex {
  return asHex(params.receiveTokenHash, 32);
}
