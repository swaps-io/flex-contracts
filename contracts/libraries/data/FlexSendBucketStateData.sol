// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {FlexSendState} from "../../interfaces/enums/FlexSendState.sol";

library FlexSendBucketStateData {
    // Content:
    // - bucket state: hash (160), state (1) [x96]

    function readHash(bytes32 bucketState_) internal pure returns (bytes20) {
        return bytes20(bucketState_);
    }

    function readState(bytes32 bucketState_, uint8 offset_) internal pure returns (FlexSendState) {
        return FlexSendState((uint256(bucketState_) >> offset_) & 1);
    }

    //

    function writeHash(bytes32 bucketState_, bytes20 hash_) internal pure returns (bytes32) {
        return bytes32(uint256(uint96(uint256(bucketState_)))) | hash_;
    }

    function writeState(bytes32 bucketState_, uint8 offset_) internal pure returns (bytes32) {
        return bucketState_ | bytes32(1 << offset_);
    }
}
