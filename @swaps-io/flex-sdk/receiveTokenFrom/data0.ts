import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexReceiveTokenFromData0Params {
  deadline: AsHexValue;
  nonce: AsHexValue;
  receiver: AsHexValue;
}

export function encodeFlexReceiveTokenFromData0(params: EncodeFlexReceiveTokenFromData0Params): Hex {
  return concatHex([
    asHex(params.deadline, 6),
    asHex(params.nonce, 6),
    asHex(params.receiver, 20),
  ]);
}
