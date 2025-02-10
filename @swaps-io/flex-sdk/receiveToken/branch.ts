import { Hex } from '../external';

import { FlexTree } from '../tree';
import { flexCalcBranch, FlexBranch } from '../branch';

export interface FlexCalcReceiveTokenBranchParams {
  tree: FlexTree;
  receiveTokenHash: Hex;
}

export function flexCalcReceiveTokenBranch(params: FlexCalcReceiveTokenBranchParams): FlexBranch {
  return flexCalcBranch({
    tree: params.tree,
    leaf: params.receiveTokenHash,
  });
}
