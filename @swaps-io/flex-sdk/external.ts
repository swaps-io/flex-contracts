/**
 * All external type & function dependencies of the Flex SDK library.
 *
 * Replacements can be provided for the exported elements in order to use a
 * different Ethereum interface if `viem` is not an option for some reason.
 */

export type { Hex, ByteArray } from 'viem';
export { isHex, toHex, concatHex, hexToBigInt, keccak256 } from 'viem';
export { assertSize } from 'viem/utils/encoding/fromHex';
