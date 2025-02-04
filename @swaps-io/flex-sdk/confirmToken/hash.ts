import { Hex, keccak256, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface CalcFlexConfirmTokenHashParams {
  domain: AsHexValue;
  data0: AsHexValue;
}

export function calcFlexConfirmTokenHash(params: CalcFlexConfirmTokenHashParams): Hex {
  return keccak256(
    concatHex([
      asHex(params.domain, 32),
      asHex(params.data0, 32),
    ]),
  );
}
