// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexSendAccumulatorData {
    // Content:
    // - accumulator data: order hash (208), start (48)

    function readStart(bytes32 data_) internal pure returns (uint48) {
        return uint48(uint256(data_));
    }

    //

    function make(bytes26 orderHash_, uint48 start_) internal pure returns (bytes32) {
        return orderHash_ | bytes32(uint256(start_));
    }
}
