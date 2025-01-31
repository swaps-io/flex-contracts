import { Hex, processMultiProof } from '../external';

import { FlexMultiBranch } from './multiBranch';

export interface CalcFlexMultiBranchHashParams {
  multiBranch: FlexMultiBranch;
}

export function calcFlexMultiBranchHash({ multiBranch: { leaves, branch, flags } }: CalcFlexMultiBranchHashParams): Hex {
  const hash = processMultiProof({
    leaves,
    proof: branch,
    proofFlags: flags,
  });
  return hash as Hex;
};
