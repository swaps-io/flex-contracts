import { Hex } from '../external';

import { FlexTree } from '../flex/tree';
import { calcFlexBranch, FlexBranch } from '../flex/branch';

export interface CalcFlexRefundTokenBranchParams {
  tree: FlexTree;
  refundTokenHash: Hex;
}

export function calcFlexRefundTokenBranch(params: CalcFlexRefundTokenBranchParams): FlexBranch {
  return calcFlexBranch({
    tree: params.tree,
    leaf: params.refundTokenHash,
  });
}
