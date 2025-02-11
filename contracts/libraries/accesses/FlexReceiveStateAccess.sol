// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexReceiveState} from "../../interfaces/enums/FlexReceiveState.sol";

library FlexReceiveStateAccess {
    function calcBucket(address receiver_, uint96 nonce_) internal pure returns (bytes32) {
        return bytes20(receiver_) | bytes32(uint256(nonce_) / 48); // 96 bit / 2 bit
    }

    function calcOffset(uint96 nonce_) internal pure returns (uint8) {
        return uint8((nonce_ % 48) << 1); // 96 bit / 2 bit
    }

    function readState(bytes32 bucketState_, uint8 offset_) internal pure returns (FlexReceiveState) {
        return FlexReceiveState((uint256(bucketState_) >> offset_) & 3); // 2 bit
    }

    function writeState(bytes32 bucketState_, uint8 offset_, FlexReceiveState state_) internal pure returns (bytes32) {
        return (bucketState_ & bytes32(~(3 << offset_))) | bytes32(uint256(state_) << offset_); // 2 bit
    }

    function readHash(bytes32 bucketState_) internal pure returns (bytes20) {
        return bytes20(bucketState_); // 160 bit
    }

    function writeHash(bytes32 bucketState_, bytes20 hash_) internal pure returns (bytes32) {
        return bytes32(uint256(uint96(uint256(bucketState_)))) | hash_;
    }
}
