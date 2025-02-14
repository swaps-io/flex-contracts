import { Hex } from '../external';

import { flexCalcSettleNativeProofHash, FlexCalcSettleNativeProofHashParams } from '../settleNativeProof';

export type FlexCalcConfirmNativeProofHashParams = FlexCalcSettleNativeProofHashParams;

export function flexCalcConfirmNativeProofHash(params: FlexCalcConfirmNativeProofHashParams): Hex {
  return flexCalcSettleNativeProofHash(params);
}
