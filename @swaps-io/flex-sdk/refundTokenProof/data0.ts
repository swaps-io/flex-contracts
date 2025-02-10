import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeRefundTokenProofData0Params {
  eventSignature: AsHexValue;
}

export function flexEncodeRefundTokenProofData0(params: FlexEncodeRefundTokenProofData0Params): Hex {
  return asHex(params.eventSignature, 32);
}
