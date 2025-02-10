import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeConfirmNativeProofData1Params {
  eventChain: AsHexValue;
}

export function flexEncodeConfirmNativeProofData1(params: FlexEncodeConfirmNativeProofData1Params): Hex {
  return asHex(params.eventChain, 32);
}
