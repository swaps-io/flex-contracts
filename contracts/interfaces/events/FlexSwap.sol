// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

event FlexSwap(
    address fromAccount,
    address fromToken,
    uint256 fromAmount,
    address toAccount,
    address toToken,
    uint256 toAmount,
    uint256 toMinAmount
);
