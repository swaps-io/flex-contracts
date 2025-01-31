import { Hex } from '../external';

import { FlexTree } from './tree';

export interface CalcFlexTreeHashParams {
  tree: FlexTree;
}

export function calcFlexTreeHash({ tree }: CalcFlexTreeHashParams): Hex {
  return tree.inner.root as Hex;
}
