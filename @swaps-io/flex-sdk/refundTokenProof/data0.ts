import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeRefundTokenProofData0Params {
  eventSignature: AsHexValue;
}

export function flexEncodeRefundTokenProofData0(params: FlexEncodeRefundTokenProofData0Params): Hex {
  return asHex(params.eventSignature, 32);
}
