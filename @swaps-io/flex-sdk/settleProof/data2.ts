import { asHex, AsHexValue, Hex } from '../external';

export interface FlexEncodeSettleProofData2Params {
  receiveHash: AsHexValue;
}

export function flexEncodeSettleProofData2(params: FlexEncodeSettleProofData2Params): Hex {
  return asHex(params.receiveHash, 32);
}
