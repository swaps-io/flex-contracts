// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IFlexSettleNativeProof} from "../interfaces/IFlexSettleNativeProof.sol";

import {FlexProofConstraint} from "../libraries/constraints/FlexProofConstraint.sol";

import {FlexSettleProofData} from "../libraries/data/FlexSettleProofData.sol";
import {FlexReceiveData} from "../libraries/data/FlexReceiveData.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain, FlexEfficientHash} from "../libraries/utilities/FlexDomain.sol";
import {FlexHashTree} from "../libraries/utilities/FlexHashTree.sol";

contract FlexSettleNativeProofFacet is IFlexSettleNativeProof {
    bytes8 private immutable _domain = FlexDomain.calc(IFlexSettleNativeProof.flexSettleNativeProof.selector);
    address private immutable _proofVerifier;

    constructor(address proofVerifier_) {
        _proofVerifier = proofVerifier_;
    }

    function flexSettleNativeProof(
        bytes32 receiveData0_,
        bytes32 receiveData1_,
        bytes32 settleData0_,
        bytes32 settleData1_,
        bytes calldata settleProof_,
        bytes32[] calldata orderBranch_
    ) external override {
        bytes32 orderHash = FlexEfficientHash.calc(receiveData0_, receiveData1_);
        orderHash = FlexEfficientHash.calc(FlexSettleProofData.writeDomain(settleData0_, _domain), settleData1_, FlexSettleProofData.make2(orderHash));
        bytes20 accumulator; (orderHash, accumulator) = FlexHashTree.calcAccumulatorBranch(orderBranch_, orderHash);

        FlexProofConstraint.verify(_proofVerifier, FlexSettleProofData.readEventSignature(settleData1_), orderHash, FlexSettleProofData.readEventChain(settleData0_), settleProof_);

        FlexReceiveStateUpdate.toSettled(FlexReceiveData.readReceiver(receiveData0_), FlexReceiveData.readNonce(receiveData0_), orderHash, accumulator, FlexSettleProofData.readConfirm(settleData0_));

        Address.sendValue(payable(FlexSettleProofData.readReceiver(settleData0_)), FlexReceiveData.readAmount(receiveData1_));
    }
}
