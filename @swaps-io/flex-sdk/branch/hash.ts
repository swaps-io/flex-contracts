import { Hex, processProof } from '../external';

import { FlexBranch } from './data';

export interface FlexCalcBranchHashParams {
  leaf: Hex;
  branch: Readonly<FlexBranch>;
}

export function flexCalcBranchHash({ leaf, branch }: FlexCalcBranchHashParams): Hex {
  const hash = processProof(leaf, branch as FlexBranch);
  return hash as Hex;
}
