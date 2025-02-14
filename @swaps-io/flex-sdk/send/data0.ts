import { asHex, AsHexValue, concatHex, Hex } from '../external';

export interface FlexEncodeSendData0Params {
  sender: AsHexValue;
}

export function flexEncodeSendData0(params: FlexEncodeSendData0Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.sender, 20),
  ]);
}
