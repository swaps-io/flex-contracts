import { Hex } from '../external';
import { FlexError } from '../utils';

export type FlexTree = Hex | [FlexTree, FlexTree];

export interface BuildFlexTreeParams {
  leaves: readonly Hex[];
}

export function buildFlexTree(params: BuildFlexTreeParams): FlexTree {
  if (params.leaves.length < 1) {
    throw new FlexError('Flex tree must have at least one leaf');
  }

  if (params.leaves.length === 1) {
    return params.leaves[0];
  }

  const center = Math.ceil(params.leaves.length / 2);
  return [
    buildFlexTree({ leaves: params.leaves.slice(0, center) }),
    buildFlexTree({ leaves: params.leaves.slice(center) }),
  ];
}
