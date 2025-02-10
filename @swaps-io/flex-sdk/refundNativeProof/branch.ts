import { Hex } from '../external';

import { FlexTree } from '../tree';
import { flexCalcBranch, FlexBranch } from '../branch';

export interface FlexCalcRefundNativeProofBranchParams {
  tree: FlexTree;
  refundNativeProofHash: Hex;
}

export function flexCalcRefundNativeProofBranch(params: FlexCalcRefundNativeProofBranchParams): FlexBranch {
  return flexCalcBranch({
    tree: params.tree,
    leaf: params.refundNativeProofHash,
  });
}
