import { Hex } from '../external';

import { FlexTree } from '../tree';
import { calcFlexBranch, FlexBranch } from '../branch';

export interface CalcFlexReceiveTokenBranchParams {
  tree: FlexTree;
  receiveTokenHash: Hex;
}

export function calcFlexReceiveTokenBranch(params: CalcFlexReceiveTokenBranchParams): FlexBranch {
  return calcFlexBranch({
    tree: params.tree,
    leaf: params.receiveTokenHash,
  });
}
