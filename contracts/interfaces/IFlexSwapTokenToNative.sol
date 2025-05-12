// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

interface IFlexSwapTokenToNative {
    function flexSwapTokenToNative(
        address fromToken,
        uint256 fromAmount,
        address toAccount,
        uint256 toMinAmount,
        address target,
        bytes calldata data
    ) external;
}
