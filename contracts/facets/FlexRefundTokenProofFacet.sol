// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexRefundTokenProof} from "../interfaces/IFlexRefundTokenProof.sol";

import {FlexRefund} from "../interfaces/events/FlexRefund.sol";

import {FlexProofConstraint} from "../libraries/constraints/FlexProofConstraint.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexEfficientHash} from "../libraries/utilities/FlexEfficientHash.sol";

contract FlexRefundTokenProofFacet is IFlexRefundTokenProof {
    bytes32 private immutable _domain;
    bytes32 private immutable _receiveDomain;
    address private immutable _proofVerifier;

    constructor(bytes32 domain_, bytes32 receiveDomain_, address proofVerifier_) {
        _domain = domain_;
        _receiveDomain = receiveDomain_;
        _proofVerifier = proofVerifier_;
    }

    function flexRefundTokenProof(
        bytes32 receiveData0_, // Content: deadline (48), nonce (40), receiver flags (8), receiver (160)
        bytes32 receiveData1_, // Content: token amount (256)
        bytes32 receiveData2_, // Content: <unused> (96), token (160)
        bytes32 refundData0_, // Content: event signature (256)
        bytes32 refundData1_, // Content: event chain (256)
        bytes32 refundData2_, // Content: <unused> (96), refund receiver (160)
        bytes calldata refundProof_,
        bytes32[] calldata componentBranch_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) external override {
        bytes32 componentHash = FlexEfficientHash.calc(_receiveDomain, receiveData0_, receiveData1_, receiveData2_);
        componentHash = FlexEfficientHash.calc(_domain, refundData0_, refundData1_, refundData2_, componentHash);
        bytes32 orderHash = MerkleProof.processProofCalldata(componentBranch_, componentHash);

        FlexProofConstraint.verify(_proofVerifier, refundData0_, orderHash, uint256(refundData1_), refundProof_);

        address receiver = address(uint160(uint256(receiveData0_)));
        uint96 nonce = uint40(uint256(receiveData0_) >> 168);
        FlexReceiveStateUpdate.toRefunded(receiver, nonce, orderHash, receiveHashBefore_, receiveOrderHashesAfter_);

        address token = address(uint160(uint256(receiveData2_)));
        receiver = address(uint160(uint256(refundData1_)));
        SafeERC20.safeTransfer(IERC20(token), receiver, uint256(receiveData1_));

        emit FlexRefund(orderHash);
    }
}
