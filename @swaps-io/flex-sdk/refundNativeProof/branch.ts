import { Hex } from '../external';

import { FlexTree } from '../tree';
import { calcFlexBranch, FlexBranch } from '../branch';

export interface CalcFlexRefundNativeProofBranchParams {
  tree: FlexTree;
  refundNativeProofHash: Hex;
}

export function calcFlexRefundNativeProofBranch(params: CalcFlexRefundNativeProofBranchParams): FlexBranch {
  return calcFlexBranch({
    tree: params.tree,
    leaf: params.refundNativeProofHash,
  });
}
