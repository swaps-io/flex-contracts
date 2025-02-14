import { Hex } from '../external';

import { flexCalcSettleTokenHash, FlexCalcSettleTokenHashParams } from '../settleToken';

export type FlexCalcConfirmTokenHashParams = FlexCalcSettleTokenHashParams;

export function flexCalcConfirmTokenHash(params: FlexCalcConfirmTokenHashParams): Hex {
  return flexCalcSettleTokenHash(params);
}
