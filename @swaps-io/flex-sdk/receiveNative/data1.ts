import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeReceiveNativeData1Params {
  amount: AsHexValue;
}

export function flexEncodeReceiveNativeData1(params: FlexEncodeReceiveNativeData1Params): Hex {
  return asHex(params.amount, 32);
}
