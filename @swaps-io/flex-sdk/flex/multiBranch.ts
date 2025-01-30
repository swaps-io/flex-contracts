import { Hex } from '../external';
import { FlexError } from '../utils';

import { FlexTree } from './tree';
import { FlexBranch } from './branch';
import { calcFlexLeaves } from './leaves';
import { calcFlexTreeHash } from './treeHash';

export interface FlexMultiBranch {
  leaves: Hex[];
  branch: FlexBranch;
  flags: boolean[];
}

export interface CalcFlexBranchesParams {
  tree: FlexTree;
  leaves: readonly Hex[];
}

export function calcFlexMultiBranch({ tree, leaves }: CalcFlexBranchesParams): FlexMultiBranch {
  const branch: Hex[] = [];
  const flags: boolean[] = [];

  const leafSiblings = new Map<Hex, Hex>();
  const leafParents = new Map<Hex, Hex>();

  function onHash(hash: Hex, hash0: Hex, hash1: Hex): void {
    leafSiblings.set(hash0, hash1);
    leafSiblings.set(hash1, hash0);
    leafParents.set(hash0, hash);
    leafParents.set(hash1, hash);
  }

  const root = calcFlexTreeHash({ tree, onHash });

  const leafIndexes = new Map(calcFlexLeaves({ tree }).map((leaf, index) => [leaf, index]));

  function getLeafIndex(leaf: Hex): number {
    const index = leafIndexes.get(leaf);
    if (index === undefined) {
      throw new FlexError('Flex tree does not contain specified multi branch leaf');
    }
    return index;
  }

  const sortedLeaves = [...leaves].sort((a, b) => getLeafIndex(b) - getLeafIndex(a));

  const leafStack = [...sortedLeaves];
  while (leafStack.length > 0 && leafStack[0] !== root) {
    const leaf = leafStack.shift()!; // Stack is not empty - `while` check
    const siblingLeaf = leafSiblings.get(leaf)!; // Only root don't have sibling - `while` check
    const parentLeaf = leafParents.get(leaf)!; // Only root don't have parent - `while` check

    if (siblingLeaf === leafStack[0]) {
      flags.push(true);
      leafStack.shift();
    } else {
      flags.push(false);
      branch.push(siblingLeaf);
    }
    leafStack.push(parentLeaf);
  }

  if (leaves.length === 0) {
    branch.push(root);
  }

  if (leaves.length + branch.length !== flags.length + 1) {
    throw new FlexError('Flex multi branch calc failed');
  }

  const multiBranch: FlexMultiBranch = {
    leaves: sortedLeaves,
    branch,
    flags,
  };
  return multiBranch;
}
