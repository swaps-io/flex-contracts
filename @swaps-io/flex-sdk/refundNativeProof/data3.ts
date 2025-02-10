import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeRefundNativeProofData3Params {
  receiveNativeHash: AsHexValue;
}

export function flexEncodeRefundNativeProofData3(params: FlexEncodeRefundNativeProofData3Params): Hex {
  return asHex(params.receiveNativeHash, 32);
}
