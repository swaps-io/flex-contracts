import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeRefundNativeProofData1Params {
  eventChain: AsHexValue;
}

export function flexEncodeRefundNativeProofData1(params: FlexEncodeRefundNativeProofData1Params): Hex {
  return asHex(params.eventChain, 32);
}
