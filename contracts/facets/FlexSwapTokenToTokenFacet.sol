// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IFlexSwapTokenToToken} from "../interfaces/IFlexSwapTokenToToken.sol";

import {FlexSwapExecution} from "../libraries/states/FlexSwapExecution.sol";

contract FlexSwapTokenToTokenFacet is IFlexSwapTokenToToken {
    function flexSwapTokenToToken(
        address fromToken_,
        uint256 fromAmount_,
        address toAccount_,
        address toToken_,
        uint256 toMinAmount_,
        address target_,
        bytes memory data_
    ) external override {
        FlexSwapExecution.tokenToToken(fromToken_, fromAmount_, toAccount_, toToken_, toMinAmount_, target_, data_);
    }
}
