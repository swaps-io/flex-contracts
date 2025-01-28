import { Hex } from '../external';
import { FlexError } from '../utils';

import { FlexTree } from './tree';

export interface CalcFlexTreeBranchParams {
  tree: FlexTree;
  leaf: Hex;
}

export function calcFlexTreeBranch(params: CalcFlexTreeBranchParams): Hex[] {
  throw new FlexError('TODO');
}
