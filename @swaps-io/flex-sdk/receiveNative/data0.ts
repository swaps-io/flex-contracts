import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexReceiveNativeData0Params {
  deadline: AsHexValue;
  nonce: AsHexValue;
  receiver: AsHexValue;
}

export function encodeFlexReceiveNativeData0(params: EncodeFlexReceiveNativeData0Params): Hex {
  return concatHex([
    asHex(params.deadline, 6),
    asHex(params.nonce, 6),
    asHex(params.receiver, 20),
  ]);
}
