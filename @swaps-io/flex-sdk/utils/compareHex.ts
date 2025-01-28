import { Hex, hexToBigInt } from '../external';

export function compareHex(a: Hex, b: Hex): number {
  const diff = hexToBigInt(a) - hexToBigInt(b);
  return diff > 0n ? 1 : diff < 0n ? -1 : 0;
};
