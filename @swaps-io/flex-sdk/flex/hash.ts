import { Hex, isHex } from '../external';

import { commutativeKeccak256 } from '../utils/commutativeKeccak256';

import { FlexTree } from './tree';

export interface CalcFlexTreeHashParams {
  tree: FlexTree;
}

export function calcFlexTreeHash(params: CalcFlexTreeHashParams): Hex {
  if (isHex(params.tree)) {
    return params.tree;
  }

  return commutativeKeccak256(
    calcFlexTreeHash({ tree: params.tree[0] }),
    calcFlexTreeHash({ tree: params.tree[1] }),
  );
}
