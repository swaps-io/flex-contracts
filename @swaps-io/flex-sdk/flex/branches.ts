import { Hex } from '../external';
import { FlexError } from '../utils';

import { FlexTree } from './tree';

export type FlexBranches = [branches: Hex[], flags: boolean[]];

export interface CalcFlexBranchesParams {
  tree: FlexTree;
  leaves: readonly Hex[];
}

export function calcFlexBranches(params: CalcFlexBranchesParams): FlexBranches {
  throw new FlexError('TODO');
}
