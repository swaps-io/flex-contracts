import { Hex } from '../external';

import { FlexTree } from '../tree';
import { calcFlexBranch, FlexBranch } from '../branch';

export interface CalcFlexRefundTokenProofBranchParams {
  tree: FlexTree;
  refundTokenProofHash: Hex;
}

export function calcFlexRefundTokenProofBranch(params: CalcFlexRefundTokenProofBranchParams): FlexBranch {
  return calcFlexBranch({
    tree: params.tree,
    leaf: params.refundTokenProofHash,
  });
}
