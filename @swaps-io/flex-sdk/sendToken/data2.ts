import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeSendTokenData2Params {
  amount: AsHexValue;
}

export function flexEncodeSendTokenData2(params: FlexEncodeSendTokenData2Params): Hex {
  return asHex(params.amount, 32);
}
