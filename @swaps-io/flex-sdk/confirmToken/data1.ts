import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeConfirmTokenData1Params {
  receiveTokenHash: AsHexValue;
}

export function flexEncodeConfirmTokenData1(params: FlexEncodeConfirmTokenData1Params): Hex {
  return asHex(params.receiveTokenHash, 32);
}
