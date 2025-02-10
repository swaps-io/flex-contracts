import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeRefundTokenProofData1Params {
  eventChain: AsHexValue;
}

export function flexEncodeRefundTokenProofData1(params: FlexEncodeRefundTokenProofData1Params): Hex {
  return asHex(params.eventChain, 32);
}
