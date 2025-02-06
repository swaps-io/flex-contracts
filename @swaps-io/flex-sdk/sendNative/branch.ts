import { Hex } from '../external';

import { FlexTree } from '../tree';
import { calcFlexBranch, FlexBranch } from '../branch';

export interface CalcFlexSendNativeBranchParams {
  tree: FlexTree;
  sendNativeHash: Hex;
}

export function calcFlexSendNativeBranch(params: CalcFlexSendNativeBranchParams): FlexBranch {
  return calcFlexBranch({
    tree: params.tree,
    leaf: params.sendNativeHash,
  });
}
