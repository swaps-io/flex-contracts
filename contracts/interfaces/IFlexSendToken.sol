// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexSendToken {
    function flexSendToken(bytes32 sendData1, bytes32 sendData2, bytes32 sendData3, bytes32[] calldata orderBranch) external;
}
