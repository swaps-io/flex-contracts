import { Hex, keccak256, concatHex, sliceHex, AsHexValue, asHex } from '../external';

export interface FlexCalcAccumulatorHashParams {
  hashBefore: AsHexValue,
  hashToAdd: AsHexValue,
}

export function flexCalcAccumulatorHash(params: FlexCalcAccumulatorHashParams): Hex {
  return sliceHex(
    keccak256(
      concatHex([
        asHex(params.hashBefore, 20),
        asHex(0, 12),
        asHex(params.hashToAdd, 32),
      ]),
    ),
    0,
    20,
  );
}
