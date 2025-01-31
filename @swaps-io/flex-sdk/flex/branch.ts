import { Hex } from '../external';

import { FlexTree } from './tree';

export type FlexBranch = Hex[];

export interface CalcFlexBranchParams {
  tree: FlexTree;
  leaf: Hex;
}

export function calcFlexBranch({ tree, leaf }: CalcFlexBranchParams): FlexBranch {
  const proof = tree.inner.getProof(leaf);
  return proof as FlexBranch;
}
