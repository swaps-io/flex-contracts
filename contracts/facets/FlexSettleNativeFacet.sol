// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IFlexSettleNative} from "../interfaces/IFlexSettleNative.sol";

import {FlexKeyConstraint} from "../libraries/constraints/FlexKeyConstraint.sol";

import {FlexSettleData} from "../libraries/data/FlexSettleData.sol";
import {FlexReceiveData} from "../libraries/data/FlexReceiveData.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain, FlexEfficientHash} from "../libraries/utilities/FlexDomain.sol";
import {FlexHashTree} from "../libraries/utilities/FlexHashTree.sol";

contract FlexSettleNativeFacet is IFlexSettleNative {
    bytes8 private immutable _domain = FlexDomain.calc(IFlexSettleNative.flexSettleNative.selector);

    function flexSettleNative(
        bytes32 receiveData0_,
        bytes32 receiveData1_,
        bytes32 settleData0_,
        bytes32 settleData1_,
        bytes32 settleKey_,
        bytes32[] calldata orderBranch_
    ) external override {
        FlexKeyConstraint.validate(FlexSettleData.readKeyHash(settleData1_), settleKey_);

        bytes32 orderHash = FlexEfficientHash.calc(receiveData0_, receiveData1_);
        orderHash = FlexEfficientHash.calc(FlexSettleData.writeDomain(settleData0_, _domain), settleData1_, FlexSettleData.make2(orderHash));
        bytes20 accumulator; (orderHash, accumulator) = FlexHashTree.calcAccumulatorBranch(orderBranch_, orderHash);

        FlexReceiveStateUpdate.toSettled(FlexReceiveData.readReceiver(receiveData0_), FlexReceiveData.readNonce(receiveData0_), orderHash, accumulator, FlexSettleData.readConfirm(settleData0_));

        Address.sendValue(payable(FlexSettleData.readReceiver(settleData0_)), FlexReceiveData.readAmount(receiveData1_));
    }
}
