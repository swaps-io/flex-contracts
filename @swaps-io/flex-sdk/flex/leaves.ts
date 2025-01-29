import { Hex, isHex } from '../external';

import { FlexTree } from './tree';

export interface CalcFlexLeavesParams {
  tree: FlexTree;
}

export function calcFlexLeaves(params: CalcFlexLeavesParams): Hex[] {
  const leaves: Hex[] = [];

  function collectLeaves(node: FlexTree): void {
    if (isHex(node)) {
      leaves.push(node);
      return;
    }

    collectLeaves(node[0]);
    collectLeaves(node[1]);
  }

  collectLeaves(params.tree);

  return leaves;
};
