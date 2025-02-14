import { asHex, AsHexValue, concatHex, Hex } from '../external';

import { FLEX_MAX_RECEIVE_DEADLINE } from '../constants';

import { flexPackFlags } from '../flags';

export interface FlexEncodeReceiveData0Params {
  contractSignature: boolean;
  noRetryAsContractSignature?: boolean;
  deadline: AsHexValue;
  receiver: AsHexValue;
}

export function flexEncodeReceiveData0(params: FlexEncodeReceiveData0Params): Hex {
  const deadline = BigInt(asHex(params.deadline, 4));
  if (deadline > FLEX_MAX_RECEIVE_DEADLINE) {
    throw new Error('Flex receive deadline exceeds max value');
  }

  return concatHex([
    asHex(
      flexPackFlags([
        params.contractSignature,
        params.noRetryAsContractSignature,
      ], 46) | deadline,
      6,
    ),
    asHex(params.deadline, 6),
    asHex(params.receiver, 20),
  ]);
}
