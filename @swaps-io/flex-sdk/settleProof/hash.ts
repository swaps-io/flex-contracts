import { Hex, AsHexValue } from '../external';

import { flexCalcComponentHash } from '../component';

export interface FlexCalcSettleProofHashParams {
  domain: AsHexValue;
  data: [AsHexValue, AsHexValue, AsHexValue];
}

export function flexCalcSettleProofHash(params: FlexCalcSettleProofHashParams): Hex {
  return flexCalcComponentHash(params);
}
