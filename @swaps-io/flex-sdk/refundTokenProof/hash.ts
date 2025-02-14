import { Hex } from '../external';

import { flexCalcSettleTokenProofHash, FlexCalcSettleTokenProofHashParams } from '../settleTokenProof';

export type FlexCalcRefundTokenProofHashParams = FlexCalcSettleTokenProofHashParams;

export function flexCalcRefundTokenProofHash(params: FlexCalcRefundTokenProofHashParams): Hex {
  return flexCalcSettleTokenProofHash(params);
}
