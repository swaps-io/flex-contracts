import { asHex, concatHex, Hex } from '../external';

import { FlexBranch } from './data';

export interface FlexCalcAccumulatorBranchParams {
  branch: Readonly<FlexBranch>;
  hashBefore: Hex,
  hashesAfter: readonly Hex[],
}

export function flexCalcAccumulatorBranch({ branch, hashBefore, hashesAfter }: FlexCalcAccumulatorBranchParams): FlexBranch {
  const offset = 1 + hashesAfter.length;
  const header = concatHex([
    asHex(hashBefore, 20),
    asHex(offset, 12),
  ]);
  const accumulatorBranch: Hex[] = [
    header,
    ...hashesAfter,
    ...branch,
  ];
  return accumulatorBranch;
}
