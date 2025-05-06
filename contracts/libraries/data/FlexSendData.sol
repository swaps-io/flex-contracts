// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

library FlexSendData {
    // Content:
    // - data #0: domain (64), <unused> (32), sender (160)
    // - data #1: deadline (48), nonce (48), receiver (160)
    // - data #2: amount (256)
    // - data #3: <unused> (96), token (160)

    function readSender(bytes32 data0_) internal pure returns (address) {
        return address(uint160(uint256(data0_)));
    }

    function readDeadline(bytes32 data1_) internal pure returns (uint48) {
        return uint48(uint256(data1_) >> 208);
    }

    function readNonce(bytes32 data1_) internal pure returns (uint48) {
        return uint48(uint256(data1_) >> 160);
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
