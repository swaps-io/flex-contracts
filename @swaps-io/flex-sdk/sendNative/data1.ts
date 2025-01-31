import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface EncodeFlexSendNativeData1Params {
  group: AsHexValue;
  nonce: AsHexValue;
  receiver: AsHexValue;
}

export function encodeFlexSendNativeData1(params: EncodeFlexSendNativeData1Params): Hex {
  return concatHex([
    asHex(params.group, 6),
    asHex(params.nonce, 6),
    asHex(params.receiver, 20),
  ]);
}
