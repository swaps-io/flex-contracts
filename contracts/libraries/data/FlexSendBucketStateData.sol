// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

library FlexSendBucketStateData {
    // Content:
    // - bucket state: hash (160), <unused> (48), time (48)

    function readHash(bytes32 bucketState_) internal pure returns (bytes20) {
        return bytes20(bucketState_);
    }

    function readTime(bytes32 bucketState_) internal pure returns (uint48) {
        return uint48(uint256(bucketState_));
    }

    //

    function writeHash(bytes32 bucketState_, bytes20 hash_) internal pure returns (bytes32) {
        return bytes32(uint256(uint96(uint256(bucketState_)))) | hash_;
    }

    function writeTime(bytes32 bucketState_, uint48 time_) internal pure returns (bytes32) {
        return bytes26(bucketState_) | bytes32(uint256(time_));
    }

    //

    function make(bytes20 hash_, uint48 time_) internal pure returns (bytes32) {
        return hash_ | bytes32(uint256(time_));
    }
}
