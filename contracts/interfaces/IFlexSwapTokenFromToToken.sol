// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

interface IFlexSwapTokenFromToToken {
    function flexSwapTokenFromToToken(
        address fromAccount,
        bytes calldata fromSignature,
        address fromToken,
        uint256 fromAmount,
        address toAccount,
        address toToken,
        uint256 toMinAmount,
        uint256 deadline,
        uint256 nonce,
        address target,
        bytes calldata data
    ) external;
}
