// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IFlexRefundNative} from "../interfaces/IFlexRefundNative.sol";

import {FlexKeyConstraint} from "../libraries/constraints/FlexKeyConstraint.sol";

import {FlexSettleData} from "../libraries/data/FlexSettleData.sol";
import {FlexReceiveData} from "../libraries/data/FlexReceiveData.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain, FlexEfficientHash} from "../libraries/utilities/FlexDomain.sol";

contract FlexRefundNativeFacet is IFlexRefundNative {
    bytes8 private immutable _domain = FlexDomain.calc(IFlexRefundNative.flexRefundNative.selector);

    function flexRefundNative(
        bytes32 receiveData0_,
        bytes32 receiveData1_,
        bytes32 refundData0_,
        bytes32 refundData1_,
        bytes32 refundKey_,
        bytes32[] calldata orderBranch_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) external override {
        FlexKeyConstraint.validate(FlexSettleData.readKeyHash(refundData1_), refundKey_);

        bytes32 orderHash = FlexEfficientHash.calc(receiveData0_, receiveData1_);
        orderHash = FlexEfficientHash.calc(FlexSettleData.writeDomain(refundData0_, _domain), refundData1_, FlexSettleData.make2(orderHash));
        orderHash = MerkleProof.processProofCalldata(orderBranch_, orderHash);

        FlexReceiveStateUpdate.toRefunded(FlexReceiveData.readReceiver(receiveData0_), FlexReceiveData.readNonce(receiveData0_), orderHash, receiveHashBefore_, receiveOrderHashesAfter_);

        Address.sendValue(payable(FlexSettleData.readReceiver(refundData0_)), FlexReceiveData.readAmount(receiveData1_));
    }
}
