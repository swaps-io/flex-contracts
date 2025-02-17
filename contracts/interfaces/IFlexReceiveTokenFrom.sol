// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexReceiveTokenFrom {
    function flexReceiveTokenFrom(
        bytes32 receivePackData0,
        bytes32 receiveData1,
        bytes32 receiveData2,
        bytes32[] calldata orderBranch,
        bytes calldata senderSignature
    ) external;
}
