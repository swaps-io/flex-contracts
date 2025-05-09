// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

library FlexReceiveData {
    // Content:
    // - data #0: signature flags (3), deadline (45), nonce (48), receiver (160)
    // - data #1: amount (256)
    // - data #2: <unused> (96), token (160)

    function readSignatureFlags(bytes32 data0_) internal pure returns (uint256) {
        return uint256(data0_ >> 253);
    }

    function readDeadline(bytes32 data0_) internal pure returns (uint48) {
        return uint48(uint256(data0_ << 3) >> 211);
    }

    function readNonce(bytes32 data0_) internal pure returns (uint48) {
        return uint48(uint256(data0_ >> 160));
    }

    function readReceiver(bytes32 data0_) internal pure returns (address) {
        return address(uint160(uint256(data0_)));
    }

    function readAmount(bytes32 data1_) internal pure returns (uint256) {
        return uint256(data1_);
    }

    function readToken(bytes32 data2_) internal pure returns (address) {
        return address(uint160(uint256(data2_)));
    }

    //

    function writeReceiver(bytes32 data0_, address receiver_) internal pure returns (bytes32) {
        return bytes12(data0_) | bytes32(uint256(uint160(receiver_)));
    }

    //

    function make1(uint256 amount_) internal pure returns (bytes32) {
        return bytes32(amount_);
    }
}
