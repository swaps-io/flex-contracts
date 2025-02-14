import { asHex, AsHexValue, Hex } from '../external';

export interface FlexEncodeSettleData2Params {
  receiveHash: AsHexValue;
}

export function flexEncodeSettleData2(params: FlexEncodeSettleData2Params): Hex {
  return asHex(params.receiveHash, 32);
}
