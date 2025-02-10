import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeConfirmTokenProofData0Params {
  eventSignature: AsHexValue;
}

export function flexEncodeConfirmTokenProofData0(params: FlexEncodeConfirmTokenProofData0Params): Hex {
  return asHex(params.eventSignature, 32);
}
