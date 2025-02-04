import { Hex } from '../external';

import { FlexTree } from '../flex/tree';
import { calcFlexMultiBranch, FlexMultiBranch } from '../flex/multiBranch';

export interface CalcFlexConfirmTokenMultiBranchParams {
  tree: FlexTree;
  receiveTokenHash: Hex;
  confirmTokenHash: Hex;
}

export function calcFlexConfirmTokenMultiBranch(params: CalcFlexConfirmTokenMultiBranchParams): FlexMultiBranch {
  return calcFlexMultiBranch({
    tree: params.tree,
    leaves: [
      params.receiveTokenHash,
      params.confirmTokenHash,
    ],
  });
}
