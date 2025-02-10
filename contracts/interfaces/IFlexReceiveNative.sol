// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexReceiveNative {
    function flexReceiveNative(
        bytes32 receiveData0, // Content: deadline (48), nonce (40), receiver flags (8), receiver (160)
        bytes32[] calldata componentBranch,
        bytes calldata receiverSignature
    ) external payable;
}
