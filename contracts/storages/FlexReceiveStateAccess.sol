// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexReceiveStateAccess {
    function bucket(address receiver_, uint96 nonce_) internal pure returns (bytes32) {
        return bytes32(bytes20(receiver_)) | bytes32(uint256(nonce_) / 48); // 96 bit / 2 bit
    }

    function offset(uint96 nonce_) internal pure returns (uint8) {
        return uint8(nonce_ % 48); // 96 bit / 2 bit
    }

    function bits(bytes32 state_, uint8 offset_) internal pure returns (uint8) {
        return uint8((uint256(state_) >> offset_) & 3); // 2 bit
    }

    function hash(bytes32 state_) internal pure returns (bytes20) {
        return bytes20(state_); // 160 bit
    }
}
