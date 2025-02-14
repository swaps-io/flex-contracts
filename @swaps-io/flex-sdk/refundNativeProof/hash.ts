import { Hex } from '../external';

import { flexCalcSettleNativeProofHash, FlexCalcSettleNativeProofHashParams } from '../settleNativeProof';

export type FlexCalcRefundNativeProofHashParams = FlexCalcSettleNativeProofHashParams;

export function flexCalcRefundNativeProofHash(params: FlexCalcRefundNativeProofHashParams): Hex {
  return flexCalcSettleNativeProofHash(params);
}
