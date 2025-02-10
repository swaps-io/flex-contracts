import { Hex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexEncodeConfirmTokenData0Params {
  keyHash: AsHexValue;
}

export function flexEncodeConfirmTokenData0(params: FlexEncodeConfirmTokenData0Params): Hex {
  return asHex(params.keyHash, 32);
}
