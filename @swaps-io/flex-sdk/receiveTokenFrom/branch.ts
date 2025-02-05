import { Hex } from '../external';

import { FlexTree } from '../flex/tree';
import { calcFlexBranch, FlexBranch } from '../flex/branch';

export interface CalcFlexReceiveTokenFromBranchParams {
  tree: FlexTree;
  receiveTokenFromHash: Hex;
}

export function calcFlexReceiveTokenFromBranch(params: CalcFlexReceiveTokenFromBranchParams): FlexBranch {
  return calcFlexBranch({
    tree: params.tree,
    leaf: params.receiveTokenFromHash,
  });
}
