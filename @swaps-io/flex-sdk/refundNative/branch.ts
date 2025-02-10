import { Hex } from '../external';

import { FlexTree } from '../tree';
import { flexCalcBranch, FlexBranch } from '../branch';

export interface FlexCalcRefundNativeBranchParams {
  tree: FlexTree;
  refundNativeHash: Hex;
}

export function flexCalcRefundNativeBranch(params: FlexCalcRefundNativeBranchParams): FlexBranch {
  return flexCalcBranch({
    tree: params.tree,
    leaf: params.refundNativeHash,
  });
}
