// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

library FlexSendFloatData {
    // Content (extension of FlexSendData):
    // - data #2: skip amount emit (1) amount (255)

    function readEmitAmount(bytes32 data2_) internal pure returns (bool) {
        return (data2_ >> 255) == 0;
    }

    function readAmount(bytes32 data2_) internal pure returns (uint256) {
        return uint256(data2_ << 1) >> 1;
    }
}
