// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexSendStateBucket {
    // Content:
    // - bucket: sender (160), group (96)

    function calcBucket(address sender_, uint96 group_) internal pure returns (bytes32) {
        return bytes20(sender_) | bytes32(uint256(group_));
    }
}
