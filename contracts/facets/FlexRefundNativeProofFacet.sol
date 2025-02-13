// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IFlexRefundNativeProof} from "../interfaces/IFlexRefundNativeProof.sol";

import {FlexProofConstraint} from "../libraries/constraints/FlexProofConstraint.sol";

import {FlexSettleProofData} from "../libraries/data/FlexSettleProofData.sol";
import {FlexReceiveData} from "../libraries/data/FlexReceiveData.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain, FlexEfficientHash} from "../libraries/utilities/FlexDomain.sol";

contract FlexRefundNativeProofFacet is IFlexRefundNativeProof {
    bytes8 private immutable _domain = FlexDomain.calc(IFlexRefundNativeProof.flexRefundNativeProof.selector);
    address private immutable _proofVerifier;

    constructor(address proofVerifier_) {
        _proofVerifier = proofVerifier_;
    }

    function flexRefundNativeProof(
        bytes32 receiveData0_,
        bytes32 receiveData1_,
        bytes32 refundData0_,
        bytes32 refundData1_,
        bytes calldata refundProof_,
        bytes32[] calldata orderBranch_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) external override {
        bytes32 orderHash = FlexEfficientHash.calc(receiveData0_, receiveData1_);
        orderHash = FlexEfficientHash.calc(FlexSettleProofData.writeDomain(refundData0_, _domain), refundData1_, FlexSettleProofData.make2(orderHash));
        orderHash = MerkleProof.processProofCalldata(orderBranch_, orderHash);

        FlexProofConstraint.verify(_proofVerifier, FlexSettleProofData.readEventSignature(refundData1_), orderHash, FlexSettleProofData.readEventChain(refundData0_), refundProof_);

        FlexReceiveStateUpdate.toRefunded(FlexReceiveData.readReceiver(receiveData0_), FlexReceiveData.readNonce(receiveData0_), orderHash, receiveHashBefore_, receiveOrderHashesAfter_);

        Address.sendValue(payable(FlexSettleProofData.readReceiver(refundData0_)), FlexReceiveData.readAmount(receiveData1_));
    }
}
