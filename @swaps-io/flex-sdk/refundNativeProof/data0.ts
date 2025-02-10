import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeRefundNativeProofData0Params {
  eventSignature: AsHexValue;
}

export function flexEncodeRefundNativeProofData0(params: FlexEncodeRefundNativeProofData0Params): Hex {
  return asHex(params.eventSignature, 32);
}
