// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexConfirmTokenProof} from "../interfaces/IFlexConfirmTokenProof.sol";

import {FlexConfirm} from "../interfaces/events/FlexConfirm.sol";

import {FlexProofConstraint} from "../libraries/constraints/FlexProofConstraint.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexEfficientHash} from "../libraries/utilities/FlexEfficientHash.sol";

contract FlexConfirmTokenProofFacet is IFlexConfirmTokenProof {
    bytes32 private immutable _domain;
    bytes32 private immutable _receiveDomain;
    address private immutable _proofVerifier;

    constructor(bytes32 domain_, bytes32 receiveDomain_, address proofVerifier_) {
        _domain = domain_;
        _receiveDomain = receiveDomain_;
        _proofVerifier = proofVerifier_;
    }

    function flexConfirmTokenProof(
        bytes32 receiveData0_, // Content: deadline (48), nonce (48), receiver (160)
        bytes32 receiveData1_, // Content: token amount (256)
        bytes32 receiveData2_, // Content: <unused> (96), token (160)
        bytes32 confirmData0_, // Content: event signature (256)
        bytes32 confirmData1_, // Content: event chain (256)
        bytes calldata confirmProof_,
        bytes32[] calldata componentBranch_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) external override {
        bytes32 componentHash = FlexEfficientHash.calc(_receiveDomain, receiveData0_, receiveData1_, receiveData2_);
        componentHash = FlexEfficientHash.calc(_domain, confirmData0_, confirmData1_, componentHash);
        bytes32 orderHash = MerkleProof.processProofCalldata(componentBranch_, componentHash);

        FlexProofConstraint.verify(_proofVerifier, confirmData0_, orderHash, uint256(confirmData1_), confirmProof_);

        address receiver = address(uint160(uint256(receiveData0_)));
        uint96 nonce = uint48(uint256(receiveData0_) >> 160);
        FlexReceiveStateUpdate.toConfirmed(receiver, nonce, orderHash, receiveHashBefore_, receiveOrderHashesAfter_);

        address token = address(uint160(uint256(receiveData2_)));
        SafeERC20.safeTransfer(IERC20(token), receiver, uint256(receiveData1_));

        emit FlexConfirm(orderHash);
    }
}
