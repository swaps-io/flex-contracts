import { Hex } from '../external';

import { FlexTree } from './data';

export interface CalcFlexTreeHashParams {
  tree: FlexTree;
}

export function calcFlexTreeHash({ tree }: CalcFlexTreeHashParams): Hex {
  return tree.inner.root as Hex;
}
