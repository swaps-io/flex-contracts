// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexReceiveFromData {
    // Content:
    // - data #0: domain (64), <unused> (32), sender (160)
    // - data #1: receive hash (256)

    function make0(bytes8 domain_, address sender_) internal pure returns (bytes32) {
        return domain_ | bytes32(uint256(uint160(sender_)));
    }

    function make1(bytes32 receiveHash_) internal pure returns (bytes32) {
        return receiveHash_;
    }
}
