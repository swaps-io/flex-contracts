import { asHex, AsHexValue, Hex } from '../external';

export interface FlexEncodeReceiveData1Params {
  amount: AsHexValue;
}

export function flexEncodeReceiveData1(params: FlexEncodeReceiveData1Params): Hex {
  return asHex(params.amount, 32);
}
