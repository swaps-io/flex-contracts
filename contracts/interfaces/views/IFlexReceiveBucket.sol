// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexReceiveBucket {
    function flexReceiveBucket(bytes32 bucket) external view returns (bytes32);
}
