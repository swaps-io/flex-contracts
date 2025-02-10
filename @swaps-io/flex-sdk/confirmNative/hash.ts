import { Hex, keccak256, concatHex, AsHexValue, asHex } from '../external';

export interface FlexCalcConfirmNativeHashParams {
  domain: AsHexValue;
  data0: AsHexValue;
  data1: AsHexValue;
}

export function flexCalcConfirmNativeHash(params: FlexCalcConfirmNativeHashParams): Hex {
  return keccak256(
    concatHex([
      asHex(params.domain, 32),
      asHex(params.data0, 32),
      asHex(params.data1, 32),
    ]),
  );
}
