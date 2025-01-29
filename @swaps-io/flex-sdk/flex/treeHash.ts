import { Hex, isHex } from '../external';

import { commutativeKeccak256 } from '../utils/commutativeKeccak256';

import { FlexTree } from './tree';

export interface CalcFlexTreeHashParams {
  tree: FlexTree;
  onHash?: (hash: Hex, hash0: Hex, hash1: Hex) => void;
}

export function calcFlexTreeHash({ tree, onHash }: CalcFlexTreeHashParams): Hex {
  if (isHex(tree)) {
    return tree;
  }

  const hash0 = calcFlexTreeHash({ tree: tree[0], onHash });
  const hash1 = calcFlexTreeHash({ tree: tree[1], onHash });
  const hash = commutativeKeccak256(hash0, hash1);

  onHash?.(hash, hash0, hash1);

  return hash;
}
