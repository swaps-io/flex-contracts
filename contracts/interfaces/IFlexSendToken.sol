// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexSendToken {
    function flexSendToken(
        bytes32 sendData1, // Content: send start (48), time to send (32), sender group (16), receiver (160)
        bytes32 sendData2, // Content: token amount (256)
        bytes32 sendData3, // Content: <unused> (96), token (160)
        bytes32[] calldata orderBranch
    ) external;
}
