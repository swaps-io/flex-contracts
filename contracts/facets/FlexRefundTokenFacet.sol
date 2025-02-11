// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexRefundToken} from "../interfaces/IFlexRefundToken.sol";

import {FlexRefund} from "../interfaces/events/FlexRefund.sol";

import {FlexKeyConstraint} from "../libraries/constraints/FlexKeyConstraint.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain} from "../libraries/utilities/FlexDomain.sol";
import {FlexEfficientHash} from "../libraries/utilities/FlexEfficientHash.sol";

contract FlexRefundTokenFacet is IFlexRefundToken {
    bytes32 private immutable _domain = FlexDomain.calc(IFlexRefundToken.flexRefundToken.selector);

    function flexRefundToken(
        bytes32 receiveData0_, // Content: deadline (48), nonce (40), receiver flags (8), receiver (160)
        bytes32 receiveData1_, // Content: token amount (256)
        bytes32 receiveData2_, // Content: <unused> (96), token (160)
        bytes32 refundData0_, // Content: key hash (256)
        bytes32 refundData1_, // Content: <unused> (96), refund receiver (160)
        bytes32 refundKey_,
        bytes32[] calldata componentBranch_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) external override {
        FlexKeyConstraint.validate(refundData0_, refundKey_);

        bytes32 componentHash = FlexEfficientHash.calc(receiveData0_, receiveData1_, receiveData2_);
        componentHash = FlexEfficientHash.calc(_domain, refundData0_, refundData1_, componentHash);
        bytes32 orderHash = MerkleProof.processProofCalldata(componentBranch_, componentHash);

        address receiver = address(uint160(uint256(receiveData0_)));
        uint96 nonce = uint40(uint256(receiveData0_) >> 168);
        FlexReceiveStateUpdate.toRefunded(receiver, nonce, orderHash, receiveHashBefore_, receiveOrderHashesAfter_);

        address token = address(uint160(uint256(receiveData2_)));
        receiver = address(uint160(uint256(refundData1_)));
        SafeERC20.safeTransfer(IERC20(token), receiver, uint256(receiveData1_));

        emit FlexRefund(orderHash);
    }
}
