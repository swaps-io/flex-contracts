// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexSettleToken {
    function flexSettleToken(
        bytes32 receiveData0,
        bytes32 receiveData1,
        bytes32 receiveData2,
        bytes32 settleData0,
        bytes32 settleData1,
        bytes32 settleKey,
        bytes32[] calldata orderBranch,
        bytes20 receiveHashBefore,
        bytes32[] calldata receiveOrderHashesAfter
    ) external;
}
