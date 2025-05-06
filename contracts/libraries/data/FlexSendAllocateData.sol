// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

library FlexSendAllocateData {
    // Content:
    // - data #0: total buckets (48), start nonce (48), sender (160)

    function readTotalBuckets(bytes32 data0_) internal pure returns (uint48) {
        return uint48(uint256(data0_ >> 208));
    }

    function readStartNonce(bytes32 data0_) internal pure returns (uint48) {
        return uint48(uint256(data0_ >> 160));
    }

    function readSender(bytes32 data0_) internal pure returns (address) {
        return address(uint160(uint256(data0_)));
    }
}
