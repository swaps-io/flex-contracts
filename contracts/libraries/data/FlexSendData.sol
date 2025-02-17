// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexSendData {
    // Content:
    // - data #0: domain (64), <unused> (32), sender (160)
    // - data #1: start (48), duration (32), group (16), receiver (160)
    // - data #2: amount (256)
    // - data #3: <unused> (96), token (160)

    function readStart(bytes32 data1_) internal pure returns (uint48) {
        return uint48(uint256(data1_) >> 208);
    }

    function readDuration(bytes32 data1_) internal pure returns (uint32) {
        return uint32(uint256(data1_) >> 176);
    }

    function readGroup(bytes32 data1_) internal pure returns (uint16) {
        return uint16(uint256(data1_) >> 160);
    }

    function readReceiver(bytes32 data1_) internal pure returns (address) {
        return address(uint160(uint256(data1_)));
    }

    function readAmount(bytes32 data2_) internal pure returns (uint256) {
        return uint256(data2_);
    }

    function readToken(bytes32 data3_) internal pure returns (address) {
        return address(uint160(uint256(data3_)));
    }

    //

    function make0(bytes8 domain_, address sender_) internal pure returns (bytes32) {
        return domain_ | bytes32(uint256(uint160(sender_)));
    }

    function make2(uint256 amount_) internal pure returns (bytes32) {
        return bytes32(amount_);
    }
}
