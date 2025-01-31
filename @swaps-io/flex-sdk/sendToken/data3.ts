import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexSendTokenData3Params {
  token: AsHexValue;
}

export function encodeFlexSendTokenData3(params: EncodeFlexSendTokenData3Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.token, 20),
  ]);
}
