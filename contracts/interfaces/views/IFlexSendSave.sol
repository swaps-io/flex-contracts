// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

interface IFlexSendSave {
    function flexSendSave(address saver, uint96 slot) external view returns (bytes32);
}
