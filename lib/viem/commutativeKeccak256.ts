import { concat, keccak256 } from 'viem';

import { Hex } from '../core/hex';

export const compareHashes = (a: Hex, b: Hex): number => {
  const diff = BigInt(a) - BigInt(b);
  return diff > 0 ? 1 : diff < 0 ? -1 : 0;
};

export const commutativeKeccak256 = (a: Hex, b: Hex): Hex => {
  return keccak256(concat([a, b].sort(compareHashes)))
};
