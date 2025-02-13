// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexRefundTokenProof {
    function flexRefundTokenProof(
        bytes32 receiveData0,
        bytes32 receiveData1,
        bytes32 receiveData2,
        bytes32 refundData0,
        bytes32 refundData1,
        bytes calldata refundProof,
        bytes32[] calldata orderBranch,
        bytes20 receiveHashBefore,
        bytes32[] calldata receiveOrderHashesAfter
    ) external;
}
