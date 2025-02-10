import { Hex, concatHex, AsHexValue, asHex } from '../external';

export interface FlexEncodeSendTokenData0Params {
  start: AsHexValue;
  duration: AsHexValue;
  sender: AsHexValue;
}

export function flexEncodeSendTokenData0(params: FlexEncodeSendTokenData0Params): Hex {
  return concatHex([
    asHex(params.start, 6),
    asHex(params.duration, 6),
    asHex(params.sender, 20),
  ]);
}
