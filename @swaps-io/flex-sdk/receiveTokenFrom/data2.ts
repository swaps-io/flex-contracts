import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeReceiveTokenFromData2Params {
  token: AsHexValue;
}

export function flexEncodeReceiveTokenFromData2(params: FlexEncodeReceiveTokenFromData2Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.token, 20),
  ]);
}
