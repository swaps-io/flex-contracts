import { Hex, concatHex, AsHexValue, asHex } from '../external';

export interface FlexEncodeReceiveTokenData2Params {
  token: AsHexValue;
}

export function flexEncodeReceiveTokenData2(params: FlexEncodeReceiveTokenData2Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.token, 20),
  ]);
}
