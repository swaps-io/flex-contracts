import { asHex, AsHexValue, Hex } from '../external';

export interface FlexEncodeReceiveFromData1Params {
  receiveHash: AsHexValue;
}

export function flexEncodeReceiveFromData1(params: FlexEncodeReceiveFromData1Params): Hex {
  return asHex(params.receiveHash, 32);
}
