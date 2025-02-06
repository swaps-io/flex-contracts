import { Hex } from '../external';

import { FlexTree } from '../tree';
import { calcFlexBranch, FlexBranch } from '../branch';

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
