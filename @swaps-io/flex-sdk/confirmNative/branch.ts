import { Hex } from '../external';

import { FlexTree } from '../tree';
import { calcFlexBranch, FlexBranch } from '../branch';

export interface CalcFlexConfirmNativeBranchParams {
  tree: FlexTree;
  confirmNativeHash: Hex;
}

export function calcFlexConfirmNativeBranch(params: CalcFlexConfirmNativeBranchParams): FlexBranch {
  return calcFlexBranch({
    tree: params.tree,
    leaf: params.confirmNativeHash,
  });
}
