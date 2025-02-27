// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

interface IFlexSendHash {
    function flexSendHash(address sender, uint48 group) external view returns (bytes20);
}
