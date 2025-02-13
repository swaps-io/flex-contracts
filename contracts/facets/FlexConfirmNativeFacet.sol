// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IFlexConfirmNative} from "../interfaces/IFlexConfirmNative.sol";

import {FlexKeyConstraint} from "../libraries/constraints/FlexKeyConstraint.sol";

import {FlexSettleData} from "../libraries/data/FlexSettleData.sol";
import {FlexReceiveData} from "../libraries/data/FlexReceiveData.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain, FlexEfficientHash} from "../libraries/utilities/FlexDomain.sol";

contract FlexConfirmNativeFacet is IFlexConfirmNative {
    bytes8 private immutable _domain = FlexDomain.calc(IFlexConfirmNative.flexConfirmNative.selector);

    function flexConfirmNative(
        bytes32 receiveData0_,
        bytes32 receiveData1_,
        bytes32 confirmData0_,
        bytes32 confirmData1_,
        bytes32 confirmKey_,
        bytes32[] calldata orderBranch_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) external override {
        FlexKeyConstraint.validate(FlexSettleData.readKeyHash(confirmData1_), confirmKey_);

        bytes32 orderHash = FlexEfficientHash.calc(receiveData0_, receiveData1_);
        orderHash = FlexEfficientHash.calc(FlexSettleData.writeDomain(confirmData0_, _domain), confirmData1_, FlexSettleData.make2(orderHash));
        orderHash = MerkleProof.processProofCalldata(orderBranch_, orderHash);

        FlexReceiveStateUpdate.toConfirmed(FlexReceiveData.readReceiver(receiveData0_), FlexReceiveData.readNonce(receiveData0_), orderHash, receiveHashBefore_, receiveOrderHashesAfter_);

        Address.sendValue(payable(FlexSettleData.readReceiver(confirmData0_)), FlexReceiveData.readAmount(receiveData1_));
    }
}
