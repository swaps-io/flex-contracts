// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexConfirmNative {
    function flexConfirmNative(
        bytes32 receiveData0, // Content: signer flags (2), deadline (46), nonce (48), receiver (160)
        bytes32 receiveData1, // Content: amount (256)
        bytes32 confirmData0, // Content: key hash (256)
        bytes32 confirmKey,
        bytes32[] calldata componentBranch,
        bytes20 receiveHashBefore,
        bytes32[] calldata receiveOrderHashesAfter
    ) external;
}
