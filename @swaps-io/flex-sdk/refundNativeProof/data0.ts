import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeRefundNativeProofData0Params {
  eventSignature: AsHexValue;
}

export function flexEncodeRefundNativeProofData0(params: FlexEncodeRefundNativeProofData0Params): Hex {
  return asHex(params.eventSignature, 32);
}
