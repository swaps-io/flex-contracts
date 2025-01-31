import { Hex, processProof } from '../external';

import { FlexBranch } from './branch';

export interface CalcFlexBranchHashParams {
  leaf: Hex;
  branch: Readonly<FlexBranch>;
}

export function calcFlexBranchHash({ leaf, branch }: CalcFlexBranchHashParams): Hex {
  const hash = processProof(leaf, branch as FlexBranch);
  return hash as Hex;
}
