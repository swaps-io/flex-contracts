// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexSendNative {
    function flexSendNative(
        bytes32 sendData0, // Content: send start (48), time to send (48), sender (160)
        bytes32 sendData1, // Content: sender group (48), nonce (48), receiver (160)
        bytes32[] calldata componentBranch
    ) external payable;
}
