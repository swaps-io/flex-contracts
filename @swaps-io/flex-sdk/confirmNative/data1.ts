import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeConfirmNativeData1Params {
  receiveNativeHash: AsHexValue;
}

export function flexEncodeConfirmNativeData1(params: FlexEncodeConfirmNativeData1Params): Hex {
  return asHex(params.receiveNativeHash, 32);
}
