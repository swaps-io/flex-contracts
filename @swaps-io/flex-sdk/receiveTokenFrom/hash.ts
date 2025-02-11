import { Hex, keccak256, concatHex, AsHexValue, asHex } from '../external';

export interface FlexCalcReceiveTokenFromHashParams {
  domain: AsHexValue;
  data0: AsHexValue;
  data1: AsHexValue;
  data2: AsHexValue;
  data3: AsHexValue;
}

export function flexCalcReceiveTokenFromHash(params: FlexCalcReceiveTokenFromHashParams): Hex {
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
