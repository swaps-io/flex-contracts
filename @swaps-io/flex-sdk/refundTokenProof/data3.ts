import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeRefundTokenProofData3Params {
  receiveTokenHash: AsHexValue;
}

export function flexEncodeRefundTokenProofData3(params: FlexEncodeRefundTokenProofData3Params): Hex {
  return asHex(params.receiveTokenHash, 32);
}
