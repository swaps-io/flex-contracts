import { Hex, ByteArray, isHex, toHex, assertSize } from '../external';

export type AsHexValue = string | number | bigint | boolean | ByteArray;

export function asHex(value: AsHexValue, size: number): Hex {
  if (!isHex(value, { strict: false })) {
    return toHex(value, { size });
  }

  assertSize(value, { size });
  return value;
};
