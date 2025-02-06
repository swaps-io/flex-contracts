import { Hex } from '../external';

import { FlexTree } from '../tree';
import { calcFlexBranch, FlexBranch } from '../branch';

export interface CalcFlexReceiveNativeBranchParams {
  tree: FlexTree;
  receiveNativeHash: Hex;
}

export function calcFlexReceiveNativeBranch(params: CalcFlexReceiveNativeBranchParams): FlexBranch {
  return calcFlexBranch({
    tree: params.tree,
    leaf: params.receiveNativeHash,
  });
}
