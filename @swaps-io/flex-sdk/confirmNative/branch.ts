import { Hex } from '../external';

import { FlexTree } from '../tree';
import { flexCalcBranch, FlexBranch } from '../branch';

export interface FlexCalcConfirmNativeBranchParams {
  tree: FlexTree;
  confirmNativeHash: Hex;
}

export function flexCalcConfirmNativeBranch(params: FlexCalcConfirmNativeBranchParams): FlexBranch {
  return flexCalcBranch({
    tree: params.tree,
    leaf: params.confirmNativeHash,
  });
}
