import { Hex, isHex } from '../external';

import { commutativeKeccak256 } from '../utils/commutativeKeccak256';

import { FlexOrderTree } from './tree';

export interface CalcFlexOrderHashParams {
  tree: FlexOrderTree;
}

export function calcFlexOrderHash(params: CalcFlexOrderHashParams): Hex {
  if (isHex(params.tree)) {
    return params.tree;
  }

  return commutativeKeccak256(
    calcFlexOrderHash({ tree: params.tree[0] }),
    calcFlexOrderHash({ tree: params.tree[1] }),
  );
}
