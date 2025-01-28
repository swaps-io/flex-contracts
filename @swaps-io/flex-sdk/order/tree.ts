import { Hex } from '../external';

import { asHex } from '../utils/asHex';

export type FlexOrderTree = Hex | [FlexOrderTree, FlexOrderTree];

export interface BuildFlexOrderTreeParams {
  componentHashes: readonly Hex[];
}

export function buildFlexOrderTree(params: BuildFlexOrderTreeParams): FlexOrderTree {
  if (params.componentHashes.length < 1) {
    return asHex(0, 32); // No components = no order
  }

  if (params.componentHashes.length === 1) {
    return params.componentHashes[0];
  }

  const center = Math.ceil(params.componentHashes.length / 2);
  return [
    buildFlexOrderTree({ componentHashes: params.componentHashes.slice(0, center) }),
    buildFlexOrderTree({ componentHashes: params.componentHashes.slice(center) }),
  ];
}
