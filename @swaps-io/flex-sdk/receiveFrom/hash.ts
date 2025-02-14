import { Hex, AsHexValue } from '../external';

import { flexCalcComponentHash } from '../component';

export interface FlexCalcReceiveFromHashParams {
  domain: AsHexValue;
  data: [AsHexValue, AsHexValue];
}

export function flexCalcReceiveFromHash(params: FlexCalcReceiveFromHashParams): Hex {
  return flexCalcComponentHash(params);
}
