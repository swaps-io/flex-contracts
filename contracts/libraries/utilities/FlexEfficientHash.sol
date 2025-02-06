// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexEfficientHash {
    function calc(bytes32 data0_) internal pure returns (bytes32 hash) {
        assembly ("memory-safe") {
            mstore(0x00, data0_)
            hash := keccak256(0x00, 0x20)
        }
    }

    function calc(bytes32 data0_, bytes32 data1_) internal pure returns (bytes32 hash) {
        assembly ("memory-safe") {
            mstore(0x00, data0_)
            mstore(0x20, data1_)
            hash := keccak256(0x00, 0x40)
        }
    }

    function calc(bytes32 data0_, bytes32 data1_, bytes32 data2_) internal pure returns (bytes32 hash) {
        assembly ("memory-safe") {
            let ptr := mload(0x40)
            mstore(ptr, data0_)
            mstore(add(ptr, 0x20), data1_)
            mstore(add(ptr, 0x40), data2_)
            hash := keccak256(ptr, 0x60)
        }
    }

    function calc(bytes32 data0_, bytes32 data1_, bytes32 data2_, bytes32 data3_) internal pure returns (bytes32 hash) {
        assembly ("memory-safe") {
            let ptr := mload(0x40)
            mstore(ptr, data0_)
            mstore(add(ptr, 0x20), data1_)
            mstore(add(ptr, 0x40), data2_)
            mstore(add(ptr, 0x60), data3_)
            hash := keccak256(ptr, 0x80)
        }
    }

    function calc(bytes32 data0_, bytes32 data1_, bytes32 data2_, bytes32 data3_, bytes32 data4_) internal pure returns (bytes32 hash) {
        assembly ("memory-safe") {
            let ptr := mload(0x40)
            mstore(ptr, data0_)
            mstore(add(ptr, 0x20), data1_)
            mstore(add(ptr, 0x40), data2_)
            mstore(add(ptr, 0x60), data3_)
            mstore(add(ptr, 0x80), data4_)
            hash := keccak256(ptr, 0xa0)
        }
    }
}
