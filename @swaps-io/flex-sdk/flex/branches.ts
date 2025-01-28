import { Hex } from '../external';
import { FlexError } from '../utils';

import { FlexTree } from './tree';

export type FlexTreeBranches = [branches: Hex[], flags: boolean[]];

export interface CalcFlexTreeBranchesParams {
  tree: FlexTree;
  leaves: readonly Hex[];
}

export function calcFlexTreeBranches(params: CalcFlexTreeBranchesParams): FlexTreeBranches {
  throw new FlexError('TODO');
}
