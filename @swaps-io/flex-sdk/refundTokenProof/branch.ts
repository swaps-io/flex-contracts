import { Hex } from '../external';

import { FlexTree } from '../tree';
import { flexCalcBranch, FlexBranch } from '../branch';

export interface FlexCalcRefundTokenProofBranchParams {
  tree: FlexTree;
  refundTokenProofHash: Hex;
}

export function flexCalcRefundTokenProofBranch(params: FlexCalcRefundTokenProofBranchParams): FlexBranch {
  return flexCalcBranch({
    tree: params.tree,
    leaf: params.refundTokenProofHash,
  });
}
