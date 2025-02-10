import { Hex, AsHexValue, asHex, concatHex } from '../external';

export interface FlexEncodeReceiveNativeData2Params {
  sender: AsHexValue;
}

export function flexEncodeReceiveNativeData2(params: FlexEncodeReceiveNativeData2Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.sender, 20),
  ]);
}
