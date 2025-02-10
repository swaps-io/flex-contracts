import { Hex, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

import { flexPackFlags } from '../flags/pack';

export interface FlexEncodeReceiveNativeData0Params {
  deadline: AsHexValue;
  nonce: AsHexValue;
  receiver: AsHexValue;
  receiverContract: boolean;
  receiverNoRetryAsContract?: boolean;
}

export function flexEncodeReceiveNativeData0(params: FlexEncodeReceiveNativeData0Params): Hex {
  return concatHex([
    asHex(params.deadline, 6),
    asHex(params.nonce, 5),
    asHex(
      flexPackFlags([
        params.receiverContract,
        params.receiverNoRetryAsContract,
      ]),
      1,
    ),
    asHex(params.receiver, 20),
  ]);
}
