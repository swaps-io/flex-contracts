import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeConfirmNativeData0Params {
  keyHash: AsHexValue;
}

export function flexEncodeConfirmNativeData0(params: FlexEncodeConfirmNativeData0Params): Hex {
  return asHex(params.keyHash, 32);
}
