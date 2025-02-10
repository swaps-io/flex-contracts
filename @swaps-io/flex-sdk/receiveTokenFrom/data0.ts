import { Hex, concatHex, AsHexValue, asHex } from '../external';

import { flexPackFlags } from '../flags';

export interface FlexEncodeReceiveTokenFromData0Params {
  sender: AsHexValue;
  senderContract: boolean;
  senderNoRetryAsContract?: boolean;
}

export function flexEncodeReceiveTokenFromData0(params: FlexEncodeReceiveTokenFromData0Params): Hex {
  return concatHex([
    asHex(0, 11),
    asHex(
      flexPackFlags([
        params.senderContract,
        params.senderNoRetryAsContract,
      ]),
      1,
    ),
    asHex(params.sender, 20),
  ]);
}
