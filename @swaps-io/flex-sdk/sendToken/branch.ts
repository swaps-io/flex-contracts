import { Hex } from '../external';

import { FlexTree } from '../tree';
import { flexCalcBranch, FlexBranch } from '../branch';

export interface FlexCalcSendTokenBranchParams {
  tree: FlexTree;
  sendTokenHash: Hex;
}

export function flexCalcSendTokenBranch(params: FlexCalcSendTokenBranchParams): FlexBranch {
  return flexCalcBranch({
    tree: params.tree,
    leaf: params.sendTokenHash,
  });
}
