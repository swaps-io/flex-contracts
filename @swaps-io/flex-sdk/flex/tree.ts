import { Hex } from '../external';
import { FlexError } from '../utils';

export type FlexTree = Hex | [FlexTree, FlexTree];

export interface BuildFlexTreeParams {
  componentHashes: readonly Hex[];
}

export function buildFlexTree(params: BuildFlexTreeParams): FlexTree {
  if (params.componentHashes.length < 1) {
    throw new FlexError('Flex tree must include at least one component');
  }

  if (params.componentHashes.length === 1) {
    return params.componentHashes[0];
  }

  const center = Math.ceil(params.componentHashes.length / 2);
  return [
    buildFlexTree({ componentHashes: params.componentHashes.slice(0, center) }),
    buildFlexTree({ componentHashes: params.componentHashes.slice(center) }),
  ];
}
