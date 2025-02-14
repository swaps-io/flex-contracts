import { asHex, AsHexValue, concatHex, Hex } from '../external';

export interface FlexEncodeReceiveFromData0Params {
  sender: AsHexValue;
}

export function flexEncodeReceiveFromData0(params: FlexEncodeReceiveFromData0Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.sender, 20),
  ]);
}
