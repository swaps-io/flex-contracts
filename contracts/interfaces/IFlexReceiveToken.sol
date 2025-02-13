// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexReceiveToken {
    function flexReceiveToken(
        bytes32 receiveData0,
        bytes32 receiveData1,
        bytes32 receiveData2,
        bytes32[] calldata orderBranch,
        bytes calldata receiverSignature
    ) external;
}
