import { Hex } from '../external';

import { FlexTree } from '../flex/tree';
import { calcFlexMultiBranch, FlexMultiBranch } from '../flex/multiBranch';

export interface CalcFlexRefundNativeMultiBranchParams {
  tree: FlexTree;
  receiveNativeHash: Hex;
  refundNativeHash: Hex;
}

export function calcFlexRefundNativeMultiBranch(params: CalcFlexRefundNativeMultiBranchParams): FlexMultiBranch {
  return calcFlexMultiBranch({
    tree: params.tree,
    leaves: [
      params.receiveNativeHash,
      params.refundNativeHash,
    ],
  });
}
