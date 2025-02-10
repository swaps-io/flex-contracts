import { Hex, concatHex, AsHexValue, asHex } from '../external';

export interface FlexEncodeRefundTokenData1Params {
  receiver: AsHexValue;
}

export function flexEncodeRefundTokenData1(params: FlexEncodeRefundTokenData1Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.receiver, 20),
  ]);
}
