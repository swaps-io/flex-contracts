// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexConfirmNative {
    event FlexConfirmNative(bytes32 indexed orderHash);

    function flexConfirmNative(
        bytes32 paramBundle0, // Content: deadline (48), nonce (48), receiver (160)
        bytes32 paramBundle1, // Content: amount (256)
        bytes32 paramBundle2, // Content: key hash (256)
        bytes32 paramBundle3, // Content: key (256)
        bytes32[] calldata componentBranch,
        bool[] calldata componentBranchFlags,
        bytes20 receiveHashBefore,
        bytes32[] calldata receiveOrderHashesAfter
    ) external;
}
