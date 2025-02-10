// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexConfirmNative {
    function flexConfirmNative(
        bytes32 receiveData0, // Content: deadline (48), nonce (40), receiver flags (8), receiver (160)
        bytes32 receiveData1, // Content: amount (256)
        bytes32 receiveData2, // Content: <unused> (96), sender (160)
        bytes32 confirmData0, // Content: key hash (256)
        bytes32 confirmKey,
        bytes32[] calldata componentBranch,
        bytes20 receiveHashBefore,
        bytes32[] calldata receiveOrderHashesAfter
    ) external;
}
