import { Hex } from '../external';

import { FlexTree } from '../tree';
import { flexCalcBranch, FlexBranch } from '../branch';

export interface FlexCalcSendNativeBranchParams {
  tree: FlexTree;
  sendNativeHash: Hex;
}

export function flexCalcSendNativeBranch(params: FlexCalcSendNativeBranchParams): FlexBranch {
  return flexCalcBranch({
    tree: params.tree,
    leaf: params.sendNativeHash,
  });
}
