import { Hex, ByteArray, isHex, toHex, padHex } from '../external';

export type AsHexValue = string | number | bigint | boolean | ByteArray;

export function asHex(value: AsHexValue, size: number): Hex {
  if (!isHex(value, { strict: false })) {
    return toHex(value, { size });
  }

  return padHex(value, { dir: 'left', size });
};
