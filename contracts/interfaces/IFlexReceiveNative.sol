// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexReceiveNative {
    function flexReceiveNative(
        bytes32 receiveData0, // Content: signer flags (2), deadline (46), nonce (48), receiver (160)
        bytes32[] calldata componentBranch,
        bytes calldata receiverSignature
    ) external payable;
}
