// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexSendNative {
    function flexSendNative(
        bytes32 sendData1, // Content: send start (48), time to send (32), sender group (16), receiver (160)
        bytes32[] calldata orderBranch
    ) external payable;
}
