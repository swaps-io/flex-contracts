import { Hex } from '../external';

import { FlexTree } from '../flex/tree';
import { calcFlexBranch, FlexBranch } from '../flex/branch';

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
