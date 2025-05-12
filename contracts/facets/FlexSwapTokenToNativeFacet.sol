// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IFlexSwapTokenToNative} from "../interfaces/IFlexSwapTokenToNative.sol";

import {FlexSwapExecution} from "../libraries/states/FlexSwapExecution.sol";

contract FlexSwapTokenToNativeFacet is IFlexSwapTokenToNative {
    function flexSwapTokenToNative(
        address fromToken_,
        uint256 fromAmount_,
        address toAccount_,
        uint256 toMinAmount_,
        address target_,
        bytes memory data_
    ) external override {
        FlexSwapExecution.tokenToNative(fromToken_, fromAmount_, toAccount_, toMinAmount_, target_, data_);
    }
}
