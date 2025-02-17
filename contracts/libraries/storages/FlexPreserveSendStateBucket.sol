// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexPreserveSendStateBucket {
    function calcBucket(address reserver_, uint96 index_) internal pure returns (bytes32) {
        return bytes20(reserver_) | bytes32(uint256(index_));
    }
}
