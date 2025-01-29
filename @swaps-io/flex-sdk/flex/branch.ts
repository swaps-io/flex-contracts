import { Hex, isHex } from '../external';
import { FlexError } from '../utils';

import { FlexTree } from './tree';
import { calcFlexTreeHash } from './treeHash';

export type FlexBranch = Hex[];

export interface CalcFlexBranchParams {
  tree: FlexTree;
  leaf: Hex;
}

export function calcFlexBranch(params: CalcFlexBranchParams): FlexBranch {
  const branch: Hex[] = [];

  function collectBranch(node: FlexTree): boolean {
    if (isHex(node)) {
      return node === params.leaf;
    }

    if (collectBranch(node[0])) {
      const hash = calcFlexTreeHash({ tree: node[1] });
      branch.push(hash);
      return true;
    }

    if (collectBranch(node[1])) {
      const hash = calcFlexTreeHash({ tree: node[0] });
      branch.push(hash);
      return true;
    }

    return false;
  }

  if (!collectBranch(params.tree)) {
    throw new FlexError('Flex tree does not contain specified branch leaf');
  }

  return branch;
}
