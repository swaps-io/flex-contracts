import { Hex, keccak256, concatHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface FlexCalcRefundTokenProofHashParams {
  domain: AsHexValue;
  data0: AsHexValue;
  data1: AsHexValue;
  data2: AsHexValue;
  data3: AsHexValue;
}

export function flexCalcRefundTokenProofHash(params: FlexCalcRefundTokenProofHashParams): Hex {
  return keccak256(
    concatHex([
      asHex(params.domain, 32),
      asHex(params.data0, 32),
      asHex(params.data1, 32),
      asHex(params.data2, 32),
      asHex(params.data3, 32),
    ]),
  );
}
