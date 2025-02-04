import { Hex } from '../external';

import { FlexTree } from '../flex/tree';
import { calcFlexMultiBranch, FlexMultiBranch } from '../flex/multiBranch';

export interface CalcFlexRefundTokenMultiBranchParams {
  tree: FlexTree;
  receiveTokenHash: Hex;
  refundTokenHash: Hex;
}

export function calcFlexRefundTokenMultiBranch(params: CalcFlexRefundTokenMultiBranchParams): FlexMultiBranch {
  return calcFlexMultiBranch({
    tree: params.tree,
    leaves: [
      params.receiveTokenHash,
      params.refundTokenHash,
    ],
  });
}
