// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IFlexSendNativeFloat} from "../interfaces/IFlexSendNativeFloat.sol";

import {FlexSendAmount} from "../interfaces/events/FlexSendAmount.sol";

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
        FlexDeadlineConstraint.validate(FlexSendData.readDeadline(sendData1_));
        FlexAmountConstraint.validate(msg.value, FlexSendFloatData.readAmount(sendData2_));

        bytes32 orderHash = FlexEfficientHash.calc(FlexSendData.make0(_domain, msg.sender), sendData1_, sendData2_);
        orderHash = FlexHashTree.calcBranch(orderBranch_, orderHash);

        FlexSendStateUpdate.toSent(msg.sender, FlexSendData.readNonce(sendData1_), orderHash);
        if (FlexSendFloatData.readEmitAmount(sendData2_)) emit FlexSendAmount(orderHash, msg.value);

        Address.sendValue(payable(FlexSendData.readReceiver(sendData1_)), msg.value);
    }
}
