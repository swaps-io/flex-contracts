import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeRefundTokenProofData2Params {
  receiver: AsHexValue;
}

export function flexEncodeRefundTokenProofData2(params: FlexEncodeRefundTokenProofData2Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.receiver, 20),
  ]);
}
