import { Hex } from '../external';
import { commutativeKeccak256 } from '../utils';

import { FlexBranch } from './branch';

export interface CalcFlexBranchHashParams {
  leaf: Hex;
  branch: Readonly<FlexBranch>;
}

export function calcFlexBranchHash(params: CalcFlexBranchHashParams): Hex {
  let hash = params.leaf;
  for (const node of params.branch) {
    hash = commutativeKeccak256(hash, node);
  }
  return hash;
}
