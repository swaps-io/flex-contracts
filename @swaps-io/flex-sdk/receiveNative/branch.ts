import { Hex } from '../external';

import { FlexTree } from '../flex/tree';
import { calcFlexTreeBranch } from '../flex/branch';

export interface CalcFlexReceiveNativeBranchParams {
  tree: FlexTree;
  receiveNativeHash: Hex;
}

export function calcFlexReceiveNativeBranch(params: CalcFlexReceiveNativeBranchParams): Hex[] {
  return calcFlexTreeBranch({
    tree: params.tree,
    leaf: params.receiveNativeHash,
  });
}
