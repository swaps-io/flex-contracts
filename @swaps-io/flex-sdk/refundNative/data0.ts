import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeRefundNativeData0Params {
  keyHash: AsHexValue;
}

export function flexEncodeRefundNativeData0(params: FlexEncodeRefundNativeData0Params): Hex {
  return asHex(params.keyHash, 32);
}
