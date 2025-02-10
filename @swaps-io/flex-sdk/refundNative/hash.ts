import { Hex, keccak256, concatHex, AsHexValue, asHex } from '../external';

export interface FlexCalcRefundNativeHashParams {
  domain: AsHexValue;
  data0: AsHexValue;
  data1: AsHexValue;
  data2: AsHexValue;
}

export function flexCalcRefundNativeHash(params: FlexCalcRefundNativeHashParams): Hex {
  return keccak256(
    concatHex([
      asHex(params.domain, 32),
      asHex(params.data0, 32),
      asHex(params.data1, 32),
      asHex(params.data2, 32),
    ]),
  );
}
