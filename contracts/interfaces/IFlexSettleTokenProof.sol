// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

interface IFlexSettleTokenProof {
    function flexSettleTokenProof(
        bytes32 receiveData0,
        bytes32 receiveData1,
        bytes32 receiveData2,
        bytes32 settleData0,
        bytes32 settleData1,
        bytes calldata settleProof,
        bytes32[] calldata orderBranch
    ) external;
}
