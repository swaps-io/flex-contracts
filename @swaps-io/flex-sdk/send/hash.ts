import { Hex, AsHexValue } from '../external';

import { flexCalcComponentHash } from '../component';

export interface FlexCalcSendHashParams {
  domain: AsHexValue;
  data: [AsHexValue, AsHexValue, AsHexValue] | [AsHexValue, AsHexValue, AsHexValue, AsHexValue];
}

export function flexCalcSendHash(params: FlexCalcSendHashParams): Hex {
  return flexCalcComponentHash(params);
}
