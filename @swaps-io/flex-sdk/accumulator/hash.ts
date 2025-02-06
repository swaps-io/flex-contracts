import { Hex, keccak256, concatHex, sliceHex } from '../external';

import { AsHexValue, asHex } from '../utils/asHex';

export interface CalcFlexAccumulatorHashParams {
  accumulatorHash: AsHexValue,
  hashToAdd: AsHexValue,
}

export function calcFlexAccumulatorHash(params: CalcFlexAccumulatorHashParams): Hex {
  return sliceHex(
    keccak256(
      concatHex([
        asHex(params.accumulatorHash, 20),
        asHex(0, 12),
        asHex(params.hashToAdd, 32),
      ]),
    ),
    0,
    20,
  );
}
