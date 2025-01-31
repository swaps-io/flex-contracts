import { Hex } from '../external';

import { FlexTree } from './tree';
import { FlexBranch } from './branch';

export interface FlexMultiBranch {
  leaves: Hex[];
  branch: FlexBranch;
  flags: boolean[];
}

export interface CalcFlexBranchesParams {
  tree: FlexTree;
  leaves: readonly Hex[];
}

export function calcFlexMultiBranch({ tree, leaves }: CalcFlexBranchesParams): FlexMultiBranch {
  const proof = tree.inner.getMultiProof(leaves as FlexBranch);
  const multiBranch: FlexMultiBranch = {
    leaves: proof.leaves as Hex[],
    branch: proof.proof as FlexBranch,
    flags: proof.proofFlags,
  };
  return multiBranch;
}
