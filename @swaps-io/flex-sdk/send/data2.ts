import { asHex, AsHexValue, Hex } from '../external';

export interface FlexEncodeSendData2Params {
  amount: AsHexValue;
}

export function flexEncodeSendData2(params: FlexEncodeSendData2Params): Hex {
  return asHex(params.amount, 32);
}
