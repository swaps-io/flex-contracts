import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexRefundTokenData1Params {
  receiver: AsHexValue;
}

export function encodeFlexRefundTokenData1(params: EncodeFlexRefundTokenData1Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.receiver, 20),
  ]);
}
