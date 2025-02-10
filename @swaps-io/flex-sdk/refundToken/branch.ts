import { Hex } from '../external';

import { FlexTree } from '../tree';
import { flexCalcBranch, FlexBranch } from '../branch';

export interface FlexCalcRefundTokenBranchParams {
  tree: FlexTree;
  refundTokenHash: Hex;
}

export function flexCalcRefundTokenBranch(params: FlexCalcRefundTokenBranchParams): FlexBranch {
  return flexCalcBranch({
    tree: params.tree,
    leaf: params.refundTokenHash,
  });
}
