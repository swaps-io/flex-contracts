/**
 * All external type & function dependencies of the Flex SDK library are listed
 * below in the "Exports" section.
 *
 * Replacements can be provided for the exported elements in order to use a
 * different implementation. For example, an Ethereum interface replacement if
 * `viem` is not an option for some reason.
 */

import {
  type Hex,
  type ByteArray,
  isHex,
  toHex,
  concatHex,
  sliceHex,
  padHex,
  keccak256,
} from 'viem';

import { SimpleMerkleTree } from '@openzeppelin/merkle-tree';
import { processProof } from '@openzeppelin/merkle-tree/dist/core';

type AsHexValue = string | number | bigint | boolean | ByteArray;

function asHex(value: AsHexValue, size: number): Hex {
  if (!isHex(value, { strict: false })) {
    return toHex(value, { size });
  }

  return padHex(value, { dir: 'left', size });
};


/**
 * Exports
 */

export {
  type Hex,
  type AsHexValue,
  asHex,
  concatHex,
  sliceHex,
  keccak256,
  SimpleMerkleTree,
  processProof,
};
