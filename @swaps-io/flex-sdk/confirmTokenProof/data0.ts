import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexConfirmTokenProofData0Params {
  eventSignature: AsHexValue;
}

export function encodeFlexConfirmTokenProofData0(params: EncodeFlexConfirmTokenProofData0Params): Hex {
  return asHex(params.eventSignature, 32);
}
