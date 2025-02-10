import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeReceiveTokenFromData3Params {
  sender: AsHexValue;
}

export function flexEncodeReceiveTokenFromData3(params: FlexEncodeReceiveTokenFromData3Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.sender, 20),
  ]);
}
