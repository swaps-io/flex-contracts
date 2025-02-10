import { Hex, concatHex, AsHexValue, asHex } from '../external';

export interface FlexEncodeReceiveTokenFromData3Params {
  sender: AsHexValue;
}

export function flexEncodeReceiveTokenFromData3(params: FlexEncodeReceiveTokenFromData3Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.sender, 20),
  ]);
}
