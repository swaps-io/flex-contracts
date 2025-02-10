import { Hex } from '../external';

import { FlexTree } from '../tree';
import { flexCalcBranch, FlexBranch } from '../branch';

export interface FlexCalcConfirmTokenProofBranchParams {
  tree: FlexTree;
  confirmTokenProofHash: Hex;
}

export function flexCalcConfirmTokenProofBranch(params: FlexCalcConfirmTokenProofBranchParams): FlexBranch {
  return flexCalcBranch({
    tree: params.tree,
    leaf: params.confirmTokenProofHash,
  });
}
