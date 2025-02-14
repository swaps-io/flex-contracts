import { asHex, AsHexValue, concatHex, Hex } from '../external';

import { FLEX_MAX_PROOF_CHAIN } from '../constants/proof';

import { flexPackFlags } from '../flags';

export interface FlexEncodeSettleProofData0Params {
  confirm: boolean;
  eventChain: AsHexValue;
  receiver: AsHexValue;
}

export function flexEncodeSettleProofData0(params: FlexEncodeSettleProofData0Params): Hex {
  const eventChain = BigInt(asHex(params.eventChain, 4));
  if (eventChain > FLEX_MAX_PROOF_CHAIN) {
    throw new Error('Flex proof chain exceeds max value');
  }

  return concatHex([
    asHex(0, 8),
    asHex(flexPackFlags([params.confirm], 31) | eventChain, 4),
    asHex(params.receiver, 20),
  ]);
}
