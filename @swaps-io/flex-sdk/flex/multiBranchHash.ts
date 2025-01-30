import { Hex } from '../external';
import { commutativeKeccak256, FlexError } from '../utils';

import { FlexMultiBranch } from './multiBranch';

export interface CalcFlexMultiBranchHashParams {
  multiBranch: FlexMultiBranch;
}

export function calcFlexMultiBranchHash({ multiBranch: { leaves, branch, flags } }: CalcFlexMultiBranchHashParams): Hex {
  if (leaves.length + branch.length !== flags.length + 1) {
    throw new FlexError('Flex multi branch invalid for hash calc');
  }

  let leafCursor = 0;
  let branchCursor = 0;
  let hashCursor = 0;

  const hashes: Hex[] = [];
  for (let i = 0; i < flags.length; i++) {
    const a = leafCursor < leaves.length ? leaves[leafCursor++] : hashes[hashCursor++];
    const b = flags[i] ? (leafCursor < leaves.length ? leaves[leafCursor++] : hashes[hashCursor++]) : branch[branchCursor++];
    const hash = commutativeKeccak256(a, b);
    hashes.push(hash);
  }

  if (flags.length > 0) {
    if (branchCursor !== branch.length) {
      throw new FlexError('Flex multi branch hash calc failed');
    }
    return hashes[flags.length - 1];
  }

  if (leaves.length > 0) {
    return leaves[0];
  }

  return branch[0];
};
