import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexSendNativeData0Params {
  start: AsHexValue;
  duration: AsHexValue;
  sender: AsHexValue;
}

export function encodeFlexSendNativeData0(params: EncodeFlexSendNativeData0Params): Hex {
  return concatHex([
    asHex(params.start, 6),
    asHex(params.duration, 6),
    asHex(params.sender, 20),
  ]);
}
