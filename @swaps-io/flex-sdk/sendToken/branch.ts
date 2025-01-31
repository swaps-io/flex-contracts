import { Hex } from '../external';

import { FlexTree } from '../flex/tree';
import { calcFlexBranch, FlexBranch } from '../flex/branch';

export interface CalcFlexSendTokenBranchParams {
  tree: FlexTree;
  sendTokenHash: Hex;
}

export function calcFlexSendTokenBranch(params: CalcFlexSendTokenBranchParams): FlexBranch {
  return calcFlexBranch({
    tree: params.tree,
    leaf: params.sendTokenHash,
  });
}
