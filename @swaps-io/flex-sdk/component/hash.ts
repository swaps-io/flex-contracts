import { Hex, keccak256, AsHexValue, concatHex, asHex } from '../external';

import { flexAssignComponentDomain } from './domain';

export interface FlexCalcComponentHashParams {
  domain: AsHexValue;
  data: readonly [AsHexValue, ...AsHexValue[]];
}

export function flexCalcComponentHash(params: FlexCalcComponentHashParams): Hex {
  return keccak256(
    concatHex([
      flexAssignComponentDomain({ domain: params.domain, data: params.data[0] }),
      ...params.data.slice(1).map((d) => asHex(d, 32)),
    ]),
  );
}
