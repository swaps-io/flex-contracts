import { Hex } from '../external';

import { flexCalcSettleTokenProofHash, FlexCalcSettleTokenProofHashParams } from '../settleTokenProof';

export type FlexCalcConfirmTokenProofHashParams = FlexCalcSettleTokenProofHashParams;

export function flexCalcConfirmTokenProofHash(params: FlexCalcConfirmTokenProofHashParams): Hex {
  return flexCalcSettleTokenProofHash(params);
}
