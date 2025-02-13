// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexReceiveNative {
    function flexReceiveNative(
        bytes32 receiveData0,
        bytes32[] calldata orderBranch,
        bytes calldata receiverSignature
    ) external payable;
}
