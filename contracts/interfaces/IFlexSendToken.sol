// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexSendToken {
    event FlexSendToken(bytes32 indexed orderHash);

    function flexSendToken(
        bytes32 sendData0, // Content: send start (48), time to send (48), sender (160)
        bytes32 sendData1, // Content: sender group (48), nonce (48), receiver (160)
        bytes32 sendData2, // Content: token amount (256)
        bytes32 sendData3, // Content: <unused> (96), token (160)
        bytes32[] calldata componentBranch
    ) external;
}
