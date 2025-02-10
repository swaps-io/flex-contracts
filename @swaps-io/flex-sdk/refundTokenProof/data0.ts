import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexRefundTokenProofData0Params {
  eventSignature: AsHexValue;
}

export function encodeFlexRefundTokenProofData0(params: EncodeFlexRefundTokenProofData0Params): Hex {
  return asHex(params.eventSignature, 32);
}
