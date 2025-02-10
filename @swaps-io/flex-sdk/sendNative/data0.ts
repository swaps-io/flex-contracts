import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeSendNativeData0Params {
  start: AsHexValue;
  duration: AsHexValue;
  sender: AsHexValue;
}

export function flexEncodeSendNativeData0(params: FlexEncodeSendNativeData0Params): Hex {
  return concatHex([
    asHex(params.start, 6),
    asHex(params.duration, 6),
    asHex(params.sender, 20),
  ]);
}
