import { Hex } from '../external';

import { FlexTree } from '../tree';
import { flexCalcBranch, FlexBranch } from '../branch';

export interface FlexCalcConfirmNativeProofBranchParams {
  tree: FlexTree;
  confirmNativeProofHash: Hex;
}

export function flexCalcConfirmNativeProofBranch(params: FlexCalcConfirmNativeProofBranchParams): FlexBranch {
  return flexCalcBranch({
    tree: params.tree,
    leaf: params.confirmNativeProofHash,
  });
}
