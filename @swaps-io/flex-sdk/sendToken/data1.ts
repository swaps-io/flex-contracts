import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexSendTokenData1Params {
  group: AsHexValue;
  nonce: AsHexValue;
  receiver: AsHexValue;
}

export function encodeFlexSendTokenData1(params: EncodeFlexSendTokenData1Params): Hex {
  return concatHex([
    asHex(params.group, 6),
    asHex(params.nonce, 6),
    asHex(params.receiver, 20),
  ]);
}
