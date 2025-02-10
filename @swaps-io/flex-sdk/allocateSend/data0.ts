import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeAllocateSendData0Params {
  sender: AsHexValue;
  startGroup: AsHexValue;
  totalBuckets: AsHexValue;
}

export function flexEncodeAllocateSendData0(params: FlexEncodeAllocateSendData0Params): Hex {
  return concatHex([
    asHex(params.totalBuckets, 6),
    asHex(params.startGroup, 6),
    asHex(params.sender, 20),
  ]);
}
