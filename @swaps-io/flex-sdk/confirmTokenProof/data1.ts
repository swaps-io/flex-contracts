import { Hex, AsHexValue, asHex } from '../external';

export interface FlexEncodeConfirmTokenProofData1Params {
  eventChain: AsHexValue;
}

export function flexEncodeConfirmTokenProofData1(params: FlexEncodeConfirmTokenProofData1Params): Hex {
  return asHex(params.eventChain, 32);
}
