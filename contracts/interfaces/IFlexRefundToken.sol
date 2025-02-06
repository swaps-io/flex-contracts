// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexRefundToken {
    function flexRefundToken(
        bytes32 receiveData0, // Content: deadline (48), nonce (48), receiver (160)
        bytes32 receiveData1, // Content: token amount (256)
        bytes32 receiveData2, // Content: <unused> (96), token (160)
        bytes32 refundData0, // Content: key hash (256)
        bytes32 refundData1, // Content: <unused> (96), refund receiver (160)
        bytes32 refundKey,
        bytes32[] calldata componentBranch,
        bytes20 receiveHashBefore,
        bytes32[] calldata receiveOrderHashesAfter
    ) external;
}
