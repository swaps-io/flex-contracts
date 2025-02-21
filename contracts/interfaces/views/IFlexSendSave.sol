// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

interface IFlexSendSave {
    function flexSendSave(address saver, uint48 group) external view returns (bytes32);
}
