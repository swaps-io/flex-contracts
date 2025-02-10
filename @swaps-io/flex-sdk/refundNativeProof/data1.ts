import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeRefundNativeProofData1Params {
  eventChain: AsHexValue;
}

export function flexEncodeRefundNativeProofData1(params: FlexEncodeRefundNativeProofData1Params): Hex {
  return asHex(params.eventChain, 32);
}
