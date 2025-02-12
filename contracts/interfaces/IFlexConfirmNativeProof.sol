// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexConfirmNativeProof {
    function flexConfirmNativeProof(
        bytes32 receiveData0, // Content: signer flags (2), deadline (46), nonce (48), receiver (160)
        bytes32 receiveData1, // Content: amount (256)
        bytes32 confirmData0, // Content: <unused> (64), event chain (192)
        bytes32 confirmData1, // Content: event signature (256)
        bytes calldata confirmProof,
        bytes32[] calldata componentBranch,
        bytes20 receiveHashBefore,
        bytes32[] calldata receiveOrderHashesAfter
    ) external;
}
