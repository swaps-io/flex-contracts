import { Hex } from '../external';

import { FlexTree } from '../tree';
import { flexCalcBranch, FlexBranch } from '../branch';

export interface FlexCalcReceiveTokenFromBranchParams {
  tree: FlexTree;
  receiveTokenFromHash: Hex;
}

export function flexCalcReceiveTokenFromBranch(params: FlexCalcReceiveTokenFromBranchParams): FlexBranch {
  return flexCalcBranch({
    tree: params.tree,
    leaf: params.receiveTokenFromHash,
  });
}
