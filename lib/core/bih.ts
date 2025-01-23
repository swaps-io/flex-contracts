import { Hex } from './hex';

/**
 * BIH - BigInt to Hex
 *
 * @param value Non-negative `bigint` value to convert to hex
 * @param size Output hex data size in bytes
 *
 * @returns Hex string that corresponds to the value
 */
export function bih(value: bigint, size = 32): Hex {
  return `0x${value.toString(16).padStart(size * 2, '0')}`;
};
