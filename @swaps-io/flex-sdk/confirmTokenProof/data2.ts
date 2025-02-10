import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeConfirmTokenProofData2Params {
  receiveTokenHash: AsHexValue;
}

export function flexEncodeConfirmTokenProofData2(params: FlexEncodeConfirmTokenProofData2Params): Hex {
  return asHex(params.receiveTokenHash, 32);
}
