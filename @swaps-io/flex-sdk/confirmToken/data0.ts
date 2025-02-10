import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeConfirmTokenData0Params {
  keyHash: AsHexValue;
}

export function flexEncodeConfirmTokenData0(params: FlexEncodeConfirmTokenData0Params): Hex {
  return asHex(params.keyHash, 32);
}
