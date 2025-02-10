import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeConfirmNativeData1Params {
  receiveNativeHash: AsHexValue;
}

export function flexEncodeConfirmNativeData1(params: FlexEncodeConfirmNativeData1Params): Hex {
  return asHex(params.receiveNativeHash, 32);
}
