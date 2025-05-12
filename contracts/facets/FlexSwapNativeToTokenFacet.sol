// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IFlexSwapNativeToToken} from "../interfaces/IFlexSwapNativeToToken.sol";

import {FlexSwapExecution} from "../libraries/states/FlexSwapExecution.sol";

contract FlexSwapNativeToTokenFacet is IFlexSwapNativeToToken {
    function flexSwapNativeToToken(
        address toAccount_,
        address toToken_,
        uint256 toMinAmount_,
        address target_,
        bytes memory data_
    ) external payable override {
        FlexSwapExecution.nativeToToken(toAccount_, toToken_, toMinAmount_, target_, data_);
    }
}
