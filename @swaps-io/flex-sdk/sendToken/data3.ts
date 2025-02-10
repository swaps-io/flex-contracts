import { Hex, concatHex, AsHexValue, asHex } from '../external';

export interface FlexEncodeSendTokenData3Params {
  token: AsHexValue;
}

export function flexEncodeSendTokenData3(params: FlexEncodeSendTokenData3Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.token, 20),
  ]);
}
