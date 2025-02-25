import { asHex, AsHexValue, Hex } from '../external';

import { FLEX_SEND_FLOAT_MAX_AMOUNT } from '../constants';

import { flexPackFlags } from '../flags';

export interface FlexEncodeSendFloatData2Params {
  amount: AsHexValue;
  skipAmountEmit?: boolean;
}

export function flexEncodeSendFloatData2(params: FlexEncodeSendFloatData2Params): Hex {
  const amount = BigInt(asHex(params.amount, 32));
  if (amount > FLEX_SEND_FLOAT_MAX_AMOUNT) {
    throw new Error('Flex send float amount exceeds max value');
  }

  return asHex(
    flexPackFlags([
      params.skipAmountEmit,
    ], 255) | amount,
    32,
  );
}
