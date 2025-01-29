import { Hex } from '../external';

import { FlexTree } from '../flex/tree';
import { calcFlexMultiBranch, FlexMultiBranch } from '../flex/multiBranch';

export interface CalcFlexConfirmNativeMultiBranchParams {
  tree: FlexTree;
  receiveNativeHash: Hex;
  confirmNativeHash: Hex;
}

export function calcFlexConfirmNativeMultiBranch(params: CalcFlexConfirmNativeMultiBranchParams): FlexMultiBranch {
  return calcFlexMultiBranch({
    tree: params.tree,
    leaves: [
      params.receiveNativeHash,
      params.confirmNativeHash,
    ],
  });
}
