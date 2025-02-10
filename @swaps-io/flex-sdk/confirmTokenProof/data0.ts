import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeConfirmTokenProofData0Params {
  eventSignature: AsHexValue;
}

export function flexEncodeConfirmTokenProofData0(params: FlexEncodeConfirmTokenProofData0Params): Hex {
  return asHex(params.eventSignature, 32);
}
