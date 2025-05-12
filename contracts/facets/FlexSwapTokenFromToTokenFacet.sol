// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

import {IFlexSwapTokenFromToToken} from "../interfaces/IFlexSwapTokenFromToToken.sol";

import {FlexSwapExecution} from "../libraries/states/FlexSwapExecution.sol";

import {FlexSignatureConstraint} from "../libraries/constraints/FlexSignatureConstraint.sol";

contract FlexSwapTokenFromToTokenFacet is IFlexSwapTokenFromToToken {
    // TODO: EIP-712
    bytes32 private constant ORDER_TYPE_HASH = keccak256("FlexSwapOrder(address fromAccount,address fromToken,uint256 fromAmount,address toAccount,address toToken,uint256 toMinAmount,uint256 deadline,uint256 nonce,address executor)");
    bytes32 private immutable DOMAIN_SEPARATOR = bytes32(block.chainid) | bytes32(IFlexSwapTokenFromToToken.flexSwapTokenFromToToken.selector);

    function flexSwapTokenFromToToken(
        address fromAccount_,
        bytes memory fromSignature_,
        address fromToken_,
        uint256 fromAmount_,
        address toAccount_,
        address toToken_,
        uint256 toMinAmount_,
        uint256 deadline_,
        uint256 nonce_,
        address target_,
        bytes memory data_
    ) external override {
        bytes32 orderHash = MessageHashUtils.toTypedDataHash(DOMAIN_SEPARATOR, keccak256(abi.encode(ORDER_TYPE_HASH, fromAccount_, fromToken_, fromAmount_, toAccount_, toToken_, toMinAmount_, deadline_, nonce_, msg.sender)));
        FlexSignatureConstraint.validate(0, fromAccount_, orderHash, fromSignature_); // TODO: flags
        FlexSwapExecution.tokenToToken(fromAccount_, fromToken_, fromAmount_, toAccount_, toToken_, toMinAmount_, target_, data_);
    }
}
