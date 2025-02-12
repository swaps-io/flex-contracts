// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexSettleNative {
    function flexSettleNative(
        bytes32 receiveData0, // Content: signer flags (2), deadline (46), nonce (48), receiver (160)
        bytes32 receiveData1, // Content: amount (256)
        bytes32 settleData0, // Content: <unused> (95), settle flags (1), settle receiver (160)
        bytes32 settleData1, // Content: key hash (256)
        bytes32 settleKey,
        bytes32[] calldata orderBranch,
        bytes20 receiveHashBefore,
        bytes32[] calldata receiveOrderHashesAfter
    ) external;
}
