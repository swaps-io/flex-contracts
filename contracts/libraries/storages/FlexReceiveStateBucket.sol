// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

library FlexReceiveStateBucket {
    // Content:
    // - bucket: receiver (160), nonce (96)

    function calcBucket(address receiver_, uint96 nonce_) internal pure returns (bytes32) {
        return bytes20(receiver_) | bytes32(uint256(nonce_) / 48); // 96 bit / 2 bit
    }

    function calcOffset(uint96 nonce_) internal pure returns (uint8) {
        return uint8((nonce_ % 48) << 1); // 96 bit / 2 bit
    }
}
