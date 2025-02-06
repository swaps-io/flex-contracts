// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexSendStateAccess {
    function calcBucket(address sender_, uint48 group_) internal pure returns (bytes32) {
        return bytes32(bytes20(sender_)) | bytes32(uint256(group_));
    }

    function readTime(bytes32 bucketState_) internal pure returns (uint48) {
        return uint48(uint256(bucketState_)); // 48 bit
    }

    function writeTime(bytes32 bucketState_, uint48 time_) internal pure returns (bytes32) {
        return (bucketState_ & 0xffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000) | bytes32(uint256(time_));
    }

    function readHash(bytes32 bucketState_) internal pure returns (bytes20) {
        return bytes20(bucketState_); // 160 bit
    }

    function writeHash(bytes32 bucketState_, bytes20 hash_) internal pure returns (bytes32) {
        return (bucketState_ & 0x0000000000000000000000000000000000000000ffffffffffffffffffffffff) | bytes32(hash_);
    }
}
