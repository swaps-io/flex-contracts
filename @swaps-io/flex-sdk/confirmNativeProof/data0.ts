import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeConfirmNativeProofData0Params {
  eventSignature: AsHexValue;
}

export function flexEncodeConfirmNativeProofData0(params: FlexEncodeConfirmNativeProofData0Params): Hex {
  return asHex(params.eventSignature, 32);
}
