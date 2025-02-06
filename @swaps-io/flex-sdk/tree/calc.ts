import { Hex, SimpleMerkleTree } from '../external';

import {FlexTree} from './data';

export interface CalcFlexTreeParams {
  leaves: readonly Hex[];
}

export function calcFlexTree({ leaves }: CalcFlexTreeParams): FlexTree {
  const uniqueLeaves = new Set(leaves.map((leaf) => leaf.toLowerCase()));
  if (uniqueLeaves.size < leaves.length) {
    throw new Error('Flex tree must have unique leaves');
  }

  const inner = SimpleMerkleTree.of([...leaves], { sortLeaves: true });
  const tree = new FlexTree(inner);
  return tree;
}
