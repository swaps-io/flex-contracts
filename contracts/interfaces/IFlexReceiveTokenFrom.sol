// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexReceiveTokenFrom {
    function flexReceiveTokenFrom(
        bytes32 receiveData0, // Content: deadline (48), nonce (48), receiver (160)
        bytes32 receiveData1, // Content: token amount (256)
        bytes32 receiveData2, // Content: <unused> (96), token (160)
        bytes32 receiveData3, // Content: <unused> (96), sender (160)
        bytes32[] calldata componentBranch,
        bytes calldata senderSignature
    ) external;
}
