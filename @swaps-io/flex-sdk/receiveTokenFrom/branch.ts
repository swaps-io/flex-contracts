import { Hex } from '../external';

import { FlexTree } from '../tree';
import { calcFlexBranch, FlexBranch } from '../branch';

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
