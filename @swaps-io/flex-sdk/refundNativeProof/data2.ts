import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeRefundNativeProofData2Params {
  receiver: AsHexValue;
}

export function flexEncodeRefundNativeProofData2(params: FlexEncodeRefundNativeProofData2Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.receiver, 20),
  ]);
}
