// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {FlexSwap} from "../../interfaces/events/FlexSwap.sol";

import {FlexMinAmountConstraint} from "../../libraries/constraints/FlexMinAmountConstraint.sol";

library FlexSwapExecution {
    modifier toNative(address fromToken_, uint256 fromAmount_, address toAccount_, uint256 toMinAmount_) {
        uint256 toAmount = toAccount_.balance;
        _;
        toAmount = toAccount_.balance - toAmount;
        _finalize(fromToken_, fromAmount_, toAccount_, address(0), toAmount, toMinAmount_);
    }

    modifier toToken(address fromToken_, uint256 fromAmount_, address toAccount_, address toToken_, uint256 toMinAmount_) {
        uint256 toAmount = IERC20(toToken_).balanceOf(toAccount_);
        _;
        toAmount = IERC20(toToken_).balanceOf(toAccount_) - toAmount;
        _finalize(fromToken_, fromAmount_, toAccount_, toToken_, toAmount, toMinAmount_);
    }

    function _finalize(address fromToken_, uint256 fromAmount_, address toAccount_, address toToken_, uint256 toAmount_, uint256 toMinAmount_) private {
        FlexMinAmountConstraint.validate(toAmount_, toMinAmount_);
        emit FlexSwap(msg.sender, fromToken_, fromAmount_, toAccount_, toToken_, toAmount_, toMinAmount_);
    }

    function _fromNative(address target_, bytes memory data_) private {
        Address.functionCallWithValue(target_, data_, msg.value);
    }

    function _fromToken(address fromToken_, uint256 fromAmount_, address target_, bytes memory data_) private {
        SafeERC20.safeTransferFrom(IERC20(fromToken_), msg.sender, target_, fromAmount_);
        Address.functionCall(target_, data_);
    }

    function nativeToToken(address toAccount_, address toToken_, uint256 toMinAmount_, address target_, bytes memory data_) internal
        toToken(address(0), msg.value, toAccount_, toToken_, toMinAmount_) {
        _fromNative(target_, data_);
    }

    function tokenToToken(address fromToken_, uint256 fromAmount_, address toAccount_, address toToken_, uint256 toMinAmount_, address target_, bytes memory data_) internal
        toToken(fromToken_, fromAmount_, toAccount_, toToken_, toMinAmount_) {
        _fromToken(fromToken_, fromAmount_, target_, data_);
    }

    function tokenToNative(address fromToken_, uint256 fromAmount_, address toAccount_, uint256 toMinAmount_, address target_, bytes memory data_) internal
        toNative(fromToken_, fromAmount_, toAccount_, toMinAmount_) {
        _fromToken(fromToken_, fromAmount_, target_, data_);
    }
}
