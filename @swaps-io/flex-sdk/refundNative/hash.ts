import { Hex } from '../external';

import { flexCalcSettleNativeHash, FlexCalcSettleNativeHashParams } from '../settleNative';

export type FlexCalcRefundNativeHashParams = FlexCalcSettleNativeHashParams;

export function flexCalcRefundNativeHash(params: FlexCalcRefundNativeHashParams): Hex {
  return flexCalcSettleNativeHash(params);
}
