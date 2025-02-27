// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

interface IFlexReceiveHash {
    function flexReceiveHash(address receiver, uint96 nonce) external view returns (bytes20);
}
