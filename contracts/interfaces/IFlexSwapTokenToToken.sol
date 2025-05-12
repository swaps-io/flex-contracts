// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

interface IFlexSwapTokenToToken {
    function flexSwapTokenToToken(
        address fromToken,
        uint256 fromAmount,
        address toAccount,
        address toToken,
        uint256 toMinAmount,
        address target,
        bytes calldata data
    ) external;
}
