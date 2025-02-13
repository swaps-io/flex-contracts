// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexSettleProofData {
    // Content:
    // - data #0: domain (64), confirm (1), event chain (31), receiver (160)
    // - data #1: event signature (256)
    // - data #2: receive hash (256)

    function readConfirm(bytes32 data0_) internal pure returns (bool) {
        return uint256(data0_ >> 191) & 1 != 0;
    }

    function readEventChain(bytes32 data0_) internal pure returns (uint32) {
        return uint32(uint256(data0_ << 65) >> 225);
    }

    function readReceiver(bytes32 data0_) internal pure returns (address) {
        return address(uint160(uint256(data0_)));
    }

    function readEventSignature(bytes32 data1_) internal pure returns (bytes32) {
        return data1_;
    }

    //

    function writeDomain(bytes32 data0_, bytes8 domain_) internal pure returns (bytes32) {
        return bytes32(uint256(uint192(uint256(data0_)))) | domain_;
    }

    //

    function make2(bytes32 receiveHash_) internal pure returns (bytes32) {
        return receiveHash_;
    }
}
