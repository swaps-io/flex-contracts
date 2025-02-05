import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexReceiveTokenFromData2Params {
  token: AsHexValue;
}

export function encodeFlexReceiveTokenFromData2(params: EncodeFlexReceiveTokenFromData2Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.token, 20),
  ]);
}
