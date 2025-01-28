// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexHashAccumulator {
    function accumulate(bytes20 hashBefore_, bytes32 hash_) internal pure returns (bytes20) {
        return bytes20(keccak256(abi.encodePacked(hashBefore_, hash_)));
    }

    function accumulateCalldata(bytes20 hashBefore_, bytes32[] calldata hashes_) internal pure returns (bytes20) {
        for (uint256 i = 0; i < hashes_.length; i++) {
            hashBefore_ = accumulate(hashBefore_, hashes_[i]);
        }
        return hashBefore_;
    }
}
