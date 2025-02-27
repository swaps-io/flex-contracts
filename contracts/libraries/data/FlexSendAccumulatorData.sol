// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexSendAccumulatorData {
    // Content:
    // - accumulator data: order hash (208), start (48)

    function make(bytes26 orderHash_, uint48 start_) internal pure returns (bytes32) {
        return orderHash_ | bytes32(uint256(start_));
    }
}
