// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

interface IFlexSendTokenFloat {
    function flexSendTokenFloat(
        bytes32 sendData1,
        bytes32 sendData2,
        bytes32 sendData3,
        uint256 amount,
        bytes32[] calldata orderBranch
    ) external;
}
