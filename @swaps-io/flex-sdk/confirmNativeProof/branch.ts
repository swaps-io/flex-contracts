import { Hex } from '../external';

import { FlexTree } from '../tree';
import { calcFlexBranch, FlexBranch } from '../branch';

export interface CalcFlexConfirmNativeProofBranchParams {
  tree: FlexTree;
  confirmNativeProofHash: Hex;
}

export function calcFlexConfirmNativeProofBranch(params: CalcFlexConfirmNativeProofBranchParams): FlexBranch {
  return calcFlexBranch({
    tree: params.tree,
    leaf: params.confirmNativeProofHash,
  });
}
