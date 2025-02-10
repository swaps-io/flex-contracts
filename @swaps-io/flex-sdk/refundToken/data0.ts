import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeRefundTokenData0Params {
  keyHash: AsHexValue;
}

export function flexEncodeRefundTokenData0(params: FlexEncodeRefundTokenData0Params): Hex {
  return asHex(params.keyHash, 32);
}
