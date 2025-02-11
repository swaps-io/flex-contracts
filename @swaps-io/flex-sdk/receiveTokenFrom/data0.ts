import { Hex, concatHex, AsHexValue, asHex } from '../external';

export interface FlexEncodeReceiveTokenFromData0Params {
  deadline: AsHexValue;
  nonce: AsHexValue;
  receiver: AsHexValue;
}

export function flexEncodeReceiveTokenFromData0(params: FlexEncodeReceiveTokenFromData0Params): Hex {
  return concatHex([
    asHex(params.deadline, 6),
    asHex(params.nonce, 5),
    asHex(0, 1),
    asHex(params.receiver, 20),
  ]);
}
