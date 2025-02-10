import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeReceiveTokenFromData0Params {
  deadline: AsHexValue;
  nonce: AsHexValue;
  receiver: AsHexValue;
}

export function flexEncodeReceiveTokenFromData0(params: FlexEncodeReceiveTokenFromData0Params): Hex {
  return concatHex([
    asHex(params.deadline, 6),
    asHex(params.nonce, 6),
    asHex(params.receiver, 20),
  ]);
}
