import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeRefundNativeData1Params {
  receiver: AsHexValue;
}

export function flexEncodeRefundNativeData1(params: FlexEncodeRefundNativeData1Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.receiver, 20),
  ]);
}
