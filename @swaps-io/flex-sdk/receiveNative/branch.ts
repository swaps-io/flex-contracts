import { Hex } from '../external';

import { FlexTree } from '../tree';
import { flexCalcBranch, FlexBranch } from '../branch';

export interface FlexCalcReceiveNativeBranchParams {
  tree: FlexTree;
  receiveNativeHash: Hex;
}

export function flexCalcReceiveNativeBranch(params: FlexCalcReceiveNativeBranchParams): FlexBranch {
  return flexCalcBranch({
    tree: params.tree,
    leaf: params.receiveNativeHash,
  });
}
