import { Hex } from '../external';

import { FlexTree } from '../tree';
import { flexCalcBranch, FlexBranch } from '../branch';

export interface FlexCalcConfirmTokenBranchParams {
  tree: FlexTree;
  confirmTokenHash: Hex;
}

export function flexCalcConfirmTokenBranch(params: FlexCalcConfirmTokenBranchParams): FlexBranch {
  return flexCalcBranch({
    tree: params.tree,
    leaf: params.confirmTokenHash,
  });
}
