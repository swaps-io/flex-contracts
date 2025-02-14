import { Hex } from '../external';

import { flexCalcSettleNativeHash, FlexCalcSettleNativeHashParams } from '../settleNative';

export type FlexCalcConfirmNativeHashParams = FlexCalcSettleNativeHashParams;

export function flexCalcConfirmNativeHash(params: FlexCalcConfirmNativeHashParams): Hex {
  return flexCalcSettleNativeHash(params);
}
