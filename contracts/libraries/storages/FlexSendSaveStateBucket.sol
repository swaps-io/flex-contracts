// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexSendSaveStateBucket {
    // Content:
    // - bucket: saver (160), slot (96)

    function calcBucket(address saver_, uint96 slot_) internal pure returns (bytes32) {
        return bytes20(saver_) | bytes32(uint256(slot_));
    }
}
