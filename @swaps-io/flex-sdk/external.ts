/**
 * All external type & function dependencies of the Flex SDK library.
 *
 * Replacements can be provided for the exported elements in order to use a
 * different implementation. For example, an Ethereum interface replacement if
 * `viem` is not an option for some reason.
 */

export type { Hex, ByteArray } from 'viem';
export { isHex, toHex, concatHex, padHex, keccak256 } from 'viem';

export { SimpleMerkleTree } from '@openzeppelin/merkle-tree';
export { processProof } from '@openzeppelin/merkle-tree/dist/core';
