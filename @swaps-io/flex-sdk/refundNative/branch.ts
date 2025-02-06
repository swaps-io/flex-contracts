import { Hex } from '../external';

import { FlexTree } from '../flex/tree';
import { calcFlexBranch, FlexBranch } from '../flex/branch';

export interface CalcFlexRefundNativeBranchParams {
  tree: FlexTree;
  refundNativeHash: Hex;
}

export function calcFlexRefundNativeBranch(params: CalcFlexRefundNativeBranchParams): FlexBranch {
  return calcFlexBranch({
    tree: params.tree,
    leaf: params.refundNativeHash,
  });
}
