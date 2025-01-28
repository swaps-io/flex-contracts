import { Hex, concatHex, keccak256 } from '../external';

import { compareHex } from './compareHex';

export function commutativeKeccak256(a: Hex, b: Hex): Hex {
  return keccak256(concatHex([a, b].sort(compareHex)))
};
