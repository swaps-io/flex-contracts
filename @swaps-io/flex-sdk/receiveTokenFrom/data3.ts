import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexReceiveTokenFromData3Params {
  sender: AsHexValue;
}

export function encodeFlexReceiveTokenFromData3(params: EncodeFlexReceiveTokenFromData3Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.sender, 20),
  ]);
}
