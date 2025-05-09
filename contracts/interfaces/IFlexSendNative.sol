// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

interface IFlexSendNative {
    function flexSendNative(bytes32 sendData1, bytes32[] calldata orderBranch) external payable;
}
