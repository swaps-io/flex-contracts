// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexSettleTokenProof {
    function flexSettleTokenProof(
        bytes32 receiveData0, // Content: signer flags (2), deadline (46), nonce (48), receiver (160)
        bytes32 receiveData1, // Content: amount (256)
        bytes32 receiveData2, // Content: <unused> (96), token (160)
        bytes32 settleData0, // Content: <unused> (64), event chain (31), settle flags (1), settle receiver (160)
        bytes32 settleData1, // Content: event signature (256)
        bytes calldata settleProof,
        bytes32[] calldata componentBranch,
        bytes20 receiveHashBefore,
        bytes32[] calldata receiveOrderHashesAfter
    ) external;
}
