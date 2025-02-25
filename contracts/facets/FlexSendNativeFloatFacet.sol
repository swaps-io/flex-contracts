// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IFlexSendNativeFloat} from "../interfaces/IFlexSendNativeFloat.sol";

import {FlexSendAmount} from "../interfaces/events/FlexSendAmount.sol";

import {FlexEarlinessConstraint} from "../libraries/constraints/FlexEarlinessConstraint.sol";
import {FlexDeadlineConstraint} from "../libraries/constraints/FlexDeadlineConstraint.sol";
import {FlexAmountConstraint} from "../libraries/constraints/FlexAmountConstraint.sol";

import {FlexSendData} from "../libraries/data/FlexSendData.sol";
import {FlexSendFloatData} from "../libraries/data/FlexSendFloatData.sol";

import {FlexSendStateUpdate} from "../libraries/states/FlexSendStateUpdate.sol";

import {FlexDomain, FlexEfficientHash} from "../libraries/utilities/FlexDomain.sol";
import {FlexHashTree} from "../libraries/utilities/FlexHashTree.sol";

contract FlexSendNativeFloatFacet is IFlexSendNativeFloat {
    bytes8 private immutable _domain = FlexDomain.calc(IFlexSendNativeFloat.flexSendNativeFloat.selector);

    function flexSendNativeFloat(bytes32 sendData1_, bytes32 sendData2_, bytes32[] calldata orderBranch_) external payable override {
        uint48 start = FlexSendData.readStart(sendData1_);
        FlexEarlinessConstraint.validate(start);
        FlexDeadlineConstraint.validate(start + FlexSendData.readDuration(sendData1_));
        FlexAmountConstraint.validate(msg.value, FlexSendFloatData.readAmount(sendData2_));

        bytes32 orderHash = FlexEfficientHash.calc(FlexSendData.make0(_domain, msg.sender), sendData1_, sendData2_);
        orderHash = FlexHashTree.calcBranch(orderBranch_, orderHash);

        FlexSendStateUpdate.toSent(msg.sender, FlexSendData.readGroup(sendData1_), start, orderHash);
        if (FlexSendFloatData.readEmitAmount(sendData2_)) emit FlexSendAmount(orderHash, msg.value);

        Address.sendValue(payable(FlexSendData.readReceiver(sendData1_)), msg.value);
    }
}
