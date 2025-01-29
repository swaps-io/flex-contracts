import { Hex, isHex } from '../external';

import { commutativeKeccak256 } from '../utils/commutativeKeccak256';

import { FlexTree } from './tree';

export interface CalcFlexTreeHashParams {
  tree: FlexTree;
  onHash?: (hash: Hex, hash0: Hex, hash1: Hex) => void;
}

export function calcFlexTreeHash(params: CalcFlexTreeHashParams): Hex {
  if (isHex(params.tree)) {
    return params.tree;
  }

  const hash0 = calcFlexTreeHash({ tree: params.tree[0] });
  const hash1 = calcFlexTreeHash({ tree: params.tree[1] });
  const hash = commutativeKeccak256(hash0, hash1);

  params.onHash?.(hash, hash0, hash1);

  return hash;
}
