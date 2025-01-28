import { Hex } from '../external';

import { FlexTree } from '../flex/tree';
import { calcFlexTreeBranches, FlexTreeBranches } from '../flex/branches';

export interface CalcFlexConfirmNativeBranchesParams {
  tree: FlexTree;
  receiveNativeHash: Hex;
  confirmNativeHash: Hex;
}

export function calcFlexConfirmNativeBranches(params: CalcFlexConfirmNativeBranchesParams): FlexTreeBranches {
  return calcFlexTreeBranches({
    tree: params.tree,
    leaves: [
      params.receiveNativeHash,
      params.confirmNativeHash,
    ],
  });
}
