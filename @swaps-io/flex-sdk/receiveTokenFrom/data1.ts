import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeReceiveTokenFromData1Params {
  receiveTokenHash: AsHexValue;
}

export function flexEncodeReceiveTokenFromData1(params: FlexEncodeReceiveTokenFromData1Params): Hex {
  return asHex(params.receiveTokenHash, 32);
}
