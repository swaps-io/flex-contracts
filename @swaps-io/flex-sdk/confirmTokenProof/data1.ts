import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexConfirmTokenProofData1Params {
  eventChain: AsHexValue;
}

export function encodeFlexConfirmTokenProofData1(params: EncodeFlexConfirmTokenProofData1Params): Hex {
  return asHex(params.eventChain, 32);
}
