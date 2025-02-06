import { Hex } from '../external';

import { FlexTree } from '../flex/tree';
import { calcFlexBranch, FlexBranch } from '../flex/branch';

export interface CalcFlexConfirmTokenBranchParams {
  tree: FlexTree;
  confirmTokenHash: Hex;
}

export function calcFlexConfirmTokenBranch(params: CalcFlexConfirmTokenBranchParams): FlexBranch {
  return calcFlexBranch({
    tree: params.tree,
    leaf: params.confirmTokenHash,
  });
}
