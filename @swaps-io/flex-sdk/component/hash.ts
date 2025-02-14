import { Hex, keccak256, AsHexValue, concatHex, asHex, sliceHex } from '../external';

export interface FlexCalcComponentHashParams {
  domain: AsHexValue;
  data: readonly [AsHexValue, ...AsHexValue[]];
}

export function flexCalcComponentHash(params: FlexCalcComponentHashParams): Hex {
  return keccak256(
    concatHex([
      asHex(params.domain, 8),
      sliceHex(asHex(params.data[0], 32), 8),
      ...params.data.slice(1).map((d) => asHex(d, 32)),
    ]),
  );
}
