import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexRefundTokenProofData1Params {
  eventChain: AsHexValue;
}

export function encodeFlexRefundTokenProofData1(params: EncodeFlexRefundTokenProofData1Params): Hex {
  return asHex(params.eventChain, 32);
}
