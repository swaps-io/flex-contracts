import { Hex, concatHex, AsHexValue, asHex } from '../external';

export interface FlexEncodeSendTokenData1Params {
  group: AsHexValue;
  nonce: AsHexValue;
  receiver: AsHexValue;
}

export function flexEncodeSendTokenData1(params: FlexEncodeSendTokenData1Params): Hex {
  return concatHex([
    asHex(params.group, 6),
    asHex(params.nonce, 6),
    asHex(params.receiver, 20),
  ]);
}
