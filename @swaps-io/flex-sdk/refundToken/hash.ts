import { Hex } from '../external';

import { flexCalcSettleTokenHash, FlexCalcSettleTokenHashParams } from '../settleToken';

export type FlexCalcRefundTokenHashParams = FlexCalcSettleTokenHashParams;

export function flexCalcRefundTokenHash(params: FlexCalcRefundTokenHashParams): Hex {
  return flexCalcSettleTokenHash(params);
}
