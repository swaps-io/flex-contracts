import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeRefundNativeData2Params {
  receiveNativeHash: AsHexValue;
}

export function flexEncodeRefundNativeData2(params: FlexEncodeRefundNativeData2Params): Hex {
  return asHex(params.receiveNativeHash, 32);
}
