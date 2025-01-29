import { Hex } from '../external';

import { FlexTree } from '../flex/tree';
import { calcFlexBranches, FlexBranches } from '../flex/branches';

export interface CalcFlexConfirmNativeBranchesParams {
  tree: FlexTree;
  receiveNativeHash: Hex;
  confirmNativeHash: Hex;
}

export function calcFlexConfirmNativeBranches(params: CalcFlexConfirmNativeBranchesParams): FlexBranches {
  return calcFlexBranches({
    tree: params.tree,
    leaves: [
      params.receiveNativeHash,
      params.confirmNativeHash,
    ],
  });
}
