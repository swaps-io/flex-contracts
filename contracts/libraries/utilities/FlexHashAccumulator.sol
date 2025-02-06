// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexHashAccumulator {
    function accumulate(bytes20 hashBefore_, bytes32 hash_) internal pure returns (bytes20) {
        return bytes20(keccak256(abi.encodePacked(hashBefore_, hash_)));
    }
}
