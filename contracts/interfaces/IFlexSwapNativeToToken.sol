// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

interface IFlexSwapNativeToToken {
    function flexSwapNativeToToken(
        address toAccount,
        address toToken,
        uint256 toMinAmount,
        address target,
        bytes calldata data
    ) external payable;
}
