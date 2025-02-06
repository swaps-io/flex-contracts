import { Hex } from '../external';

import { FlexTree } from '../tree';

import { FlexBranch } from './data';

export interface CalcFlexBranchParams {
  tree: FlexTree;
  leaf: Hex;
}

export function calcFlexBranch({ tree, leaf }: CalcFlexBranchParams): FlexBranch {
  const proof = tree.inner.getProof(leaf);
  return proof as FlexBranch;
}
