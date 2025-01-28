import { Hex, keccak256, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface CalcFlexConfirmNativeHashParams {
  domain: AsHexValue;
  data0: AsHexValue;
}

export function calcFlexConfirmNativeHash(params: CalcFlexConfirmNativeHashParams): Hex {
  return keccak256(concatHex([
    asHex(params.domain, 32),
    asHex(params.data0, 32),
  ]));
}
