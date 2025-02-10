import { Hex } from '../external';

import { FlexTree } from './data';

export interface FlexCalcTreeHashParams {
  tree: FlexTree;
}

export function flexCalcTreeHash({ tree }: FlexCalcTreeHashParams): Hex {
  return tree.inner.root as Hex;
}
