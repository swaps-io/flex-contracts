import { Hex, concatHex, AsHexValue, asHex } from '../external';

export interface FlexEncodeSendNativeData1Params {
  group: AsHexValue;
  nonce: AsHexValue;
  receiver: AsHexValue;
}

export function flexEncodeSendNativeData1(params: FlexEncodeSendNativeData1Params): Hex {
  return concatHex([
    asHex(params.group, 6),
    asHex(params.nonce, 6),
    asHex(params.receiver, 20),
  ]);
}
