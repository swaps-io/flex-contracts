import { asHex, AsHexValue, concatHex, Hex } from '../external';

export interface FlexEncodeSendData3Params {
  token: AsHexValue;
}

export function flexEncodeSendData3(params: FlexEncodeSendData3Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.token, 20),
  ]);
}
