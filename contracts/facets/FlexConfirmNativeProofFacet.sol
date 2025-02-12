// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IFlexConfirmNativeProof} from "../interfaces/IFlexConfirmNativeProof.sol";

import {FlexConfirm} from "../interfaces/events/FlexConfirm.sol";

import {FlexProofConstraint} from "../libraries/constraints/FlexProofConstraint.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain} from "../libraries/utilities/FlexDomain.sol";
import {FlexEfficientHash} from "../libraries/utilities/FlexEfficientHash.sol";

contract FlexConfirmNativeProofFacet is IFlexConfirmNativeProof {
    bytes32 private immutable _domain = FlexDomain.calc(IFlexConfirmNativeProof.flexConfirmNativeProof.selector);
    address private immutable _proofVerifier;

    constructor(address proofVerifier_) {
        _proofVerifier = proofVerifier_;
    }

    function flexConfirmNativeProof(
        bytes32 receiveData0_, // Content: signer flags (2), deadline (46), nonce (48), receiver (160)
        bytes32 receiveData1_, // Content: amount (256)
        bytes32 confirmData0_, // Content: <unused> (64), event chain (192)
        bytes32 confirmData1_, // Content: event signature (256)
        bytes calldata confirmProof_,
        bytes32[] calldata componentBranch_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) external override {
        uint192 eventChain = uint192(uint256(confirmData0_));

        bytes32 orderHash = FlexEfficientHash.calc(receiveData0_, receiveData1_);
        orderHash = FlexEfficientHash.calc(_domain | bytes32(uint256(eventChain)), confirmData1_, orderHash);
        orderHash = MerkleProof.processProofCalldata(componentBranch_, orderHash);

        FlexProofConstraint.verify(_proofVerifier, confirmData1_, orderHash, eventChain, confirmProof_);

        address receiver = address(uint160(uint256(receiveData0_)));
        FlexReceiveStateUpdate.toConfirmed(receiver, uint48(uint256(receiveData0_) >> 160), orderHash, receiveHashBefore_, receiveOrderHashesAfter_);

        Address.sendValue(payable(receiver), uint256(receiveData1_));

        emit FlexConfirm(orderHash);
    }
}
