import { Hex, AsHexValue } from '../external';

import { flexCalcComponentHash } from '../component';

export interface FlexCalcSettleHashParams {
  domain: AsHexValue;
  data: [AsHexValue, AsHexValue, AsHexValue];
}

export function flexCalcSettleHash(params: FlexCalcSettleHashParams): Hex {
  return flexCalcComponentHash(params);
}
