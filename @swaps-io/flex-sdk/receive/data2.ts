import { asHex, AsHexValue, concatHex, Hex } from '../external';

export interface FlexEncodeReceiveData2Params {
  token: AsHexValue;
}

export function flexEncodeReceiveData2(params: FlexEncodeReceiveData2Params): Hex {
  return concatHex([
    asHex(0, 12),
    asHex(params.token, 20),
  ]);
}
