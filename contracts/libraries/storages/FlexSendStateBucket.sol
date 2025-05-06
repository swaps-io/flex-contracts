// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

library FlexSendStateBucket {
    // Content:
    // - bucket: sender (160), nonce (96)

    function calcBucket(address sender_, uint96 nonce_) internal pure returns (bytes32) {
        return bytes20(sender_) | bytes32(uint256(nonce_) / 96); // 96 bit / 1 bit
    }

    function calcOffset(uint96 nonce_) internal pure returns (uint8) {
        return uint8(nonce_ % 96); // 96 bit / 1 bit
    }
}
