// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexSaveSendData {
    // Content:
    // - data #0: slot (48), group (48), sender (160)

    function readSlot(bytes32 data0_) internal pure returns (uint48) {
        return uint48(uint256(data0_ >> 208));
    }

    function readGroup(bytes32 data0_) internal pure returns (uint48) {
        return uint48(uint256(data0_ >> 160));
    }

    function readSender(bytes32 data0_) internal pure returns (address) {
        return address(uint160(uint256(data0_)));
    }
}
