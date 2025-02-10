import { Hex, keccak256, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexCalcReceiveNativeHashParams {
  domain: AsHexValue;
  data0: AsHexValue;
  data1: AsHexValue;
}

export function flexCalcReceiveNativeHash(params: FlexCalcReceiveNativeHashParams): Hex {
  return keccak256(
    concatHex([
      asHex(params.domain, 32),
      asHex(params.data0, 32),
      asHex(params.data1, 32),
    ]),
  );
}
