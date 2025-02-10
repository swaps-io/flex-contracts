import { Hex } from '../external';

import { FlexTree } from '../tree';
import { calcFlexBranch, FlexBranch } from '../branch';

export interface CalcFlexConfirmTokenProofBranchParams {
  tree: FlexTree;
  confirmTokenProofHash: Hex;
}

export function calcFlexConfirmTokenProofBranch(params: CalcFlexConfirmTokenProofBranchParams): FlexBranch {
  return calcFlexBranch({
    tree: params.tree,
    leaf: params.confirmTokenProofHash,
  });
}
