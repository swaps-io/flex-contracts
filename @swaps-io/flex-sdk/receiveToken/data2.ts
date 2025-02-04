import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexReceiveTokenData2Params {
  token: AsHexValue;
}

export function encodeFlexReceiveTokenData2(params: EncodeFlexReceiveTokenData2Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.token, 20),
  ]);
}
