import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeConfirmNativeProofData2Params {
  receiveNativeHash: AsHexValue;
}

export function flexEncodeConfirmNativeProofData2(params: FlexEncodeConfirmNativeProofData2Params): Hex {
  return asHex(params.receiveNativeHash, 32);
}
