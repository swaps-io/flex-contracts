// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexConfirmNativeProof {
    function flexConfirmNativeProof(
        bytes32 receiveData0,
        bytes32 receiveData1,
        bytes32 confirmData0,
        bytes32 confirmData1,
        bytes calldata confirmProof,
        bytes32[] calldata orderBranch,
        bytes20 receiveHashBefore,
        bytes32[] calldata receiveOrderHashesAfter
    ) external;
}
