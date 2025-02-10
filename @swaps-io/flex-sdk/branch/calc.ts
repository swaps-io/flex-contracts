import { Hex } from '../external';

import { FlexTree } from '../tree';

import { FlexBranch } from './data';

export interface FlexCalcBranchParams {
  tree: FlexTree;
  leaf: Hex;
}

export function flexCalcBranch({ tree, leaf }: FlexCalcBranchParams): FlexBranch {
  const proof = tree.inner.getProof(leaf);
  return proof as FlexBranch;
}
