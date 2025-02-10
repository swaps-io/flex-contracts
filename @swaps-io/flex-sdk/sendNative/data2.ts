import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeSendNativeData2Params {
  amount: AsHexValue;
}

export function flexEncodeSendNativeData2(params: FlexEncodeSendNativeData2Params): Hex {
  return asHex(params.amount, 32);
}
