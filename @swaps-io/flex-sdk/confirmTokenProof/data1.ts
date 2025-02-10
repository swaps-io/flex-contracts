import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeConfirmTokenProofData1Params {
  eventChain: AsHexValue;
}

export function flexEncodeConfirmTokenProofData1(params: FlexEncodeConfirmTokenProofData1Params): Hex {
  return asHex(params.eventChain, 32);
}
