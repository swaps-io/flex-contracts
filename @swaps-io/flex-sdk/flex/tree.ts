import { Hex } from '../external';
import { FlexError } from '../utils';

export type FlexTree = Hex | [FlexTree, FlexTree];

export interface CalcFlexTreeParams {
  leaves: readonly Hex[];
}

export function calcFlexTree(params: CalcFlexTreeParams): FlexTree {
  if (params.leaves.length < 1) {
    throw new FlexError('Flex tree must have at least one leaf');
  }

  if (params.leaves.length === 1) {
    return params.leaves[0];
  }

  const center = Math.ceil(params.leaves.length / 2);
  return [
    calcFlexTree({ leaves: params.leaves.slice(0, center) }),
    calcFlexTree({ leaves: params.leaves.slice(center) }),
  ];
}
