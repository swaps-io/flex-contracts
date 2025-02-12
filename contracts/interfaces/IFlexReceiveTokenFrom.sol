// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexReceiveTokenFrom {
    function flexReceiveTokenFrom(
        bytes32 receiveFromData0, // Content: signer flags (2), deadline(46), nonce (48), sender (160)
        bytes32 receiveData1, // Content: token amount (256)
        bytes32 receiveData2, // Content: <unused> (96), token (160)
        bytes32[] calldata componentBranch,
        bytes calldata senderSignature
    ) external;
}
