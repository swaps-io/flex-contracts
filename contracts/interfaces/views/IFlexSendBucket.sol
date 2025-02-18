// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexSendBucket {
    function flexSendBucket(bytes32 bucket) external view returns (bytes32);
}
