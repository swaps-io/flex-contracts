// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IFlexSettleNativeProof} from "../interfaces/IFlexSettleNativeProof.sol";

import {FlexProofConstraint} from "../libraries/constraints/FlexProofConstraint.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain, FlexEfficientHash} from "../libraries/utilities/FlexDomain.sol";

contract FlexSettleNativeProofFacet is IFlexSettleNativeProof {
    bytes32 private immutable _domain = FlexDomain.calc(IFlexSettleNativeProof.flexSettleNativeProof.selector);
    address private immutable _proofVerifier;

    constructor(address proofVerifier_) {
        _proofVerifier = proofVerifier_;
    }

    function flexSettleNativeProof(
        bytes32 receiveData0_, // Content: signer flags (2), deadline (46), nonce (48), receiver (160)
        bytes32 receiveData1_, // Content: amount (256)
        bytes32 settleData0_, // Content: <unused> (64), event chain (31), settle flags (1), settle receiver (160)
        bytes32 settleData1_, // Content: event signature (256)
        bytes calldata settleProof_,
        bytes32[] calldata orderBranch_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) external override {
        bytes32 orderHash = FlexEfficientHash.calc(receiveData0_, receiveData1_);
        orderHash = FlexEfficientHash.calc(_domain | bytes32(uint256(uint192(uint256(settleData0_)))), settleData1_, orderHash);
        orderHash = MerkleProof.processProofCalldata(orderBranch_, orderHash);

        FlexProofConstraint.verify(_proofVerifier, settleData1_, orderHash, uint256(settleData0_ << 64) >> 225, settleProof_);

        FlexReceiveStateUpdate.toSettled(receiveData0_, settleData0_, orderHash, receiveHashBefore_, receiveOrderHashesAfter_);

        Address.sendValue(payable(address(uint160(uint256(settleData0_)))), uint256(receiveData1_));
    }
}
