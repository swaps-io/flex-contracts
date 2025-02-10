import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeRefundNativeProofData3Params {
  receiveNativeHash: AsHexValue;
}

export function flexEncodeRefundNativeProofData3(params: FlexEncodeRefundNativeProofData3Params): Hex {
  return asHex(params.receiveNativeHash, 32);
}
