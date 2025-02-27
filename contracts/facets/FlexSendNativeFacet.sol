// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IFlexSendNative} from "../interfaces/IFlexSendNative.sol";

import {FlexSendPeriodConstraint} from "../libraries/constraints/FlexSendPeriodConstraint.sol";

import {FlexSendData} from "../libraries/data/FlexSendData.sol";

import {FlexSendStateUpdate} from "../libraries/states/FlexSendStateUpdate.sol";

import {FlexDomain, FlexEfficientHash} from "../libraries/utilities/FlexDomain.sol";
import {FlexHashTree} from "../libraries/utilities/FlexHashTree.sol";

contract FlexSendNativeFacet is IFlexSendNative {
    bytes8 private immutable _domain = FlexDomain.calc(IFlexSendNative.flexSendNative.selector);

    function flexSendNative(bytes32 sendData1_, bytes32[] calldata orderBranch_) external payable override {
        uint48 start = FlexSendData.readStart(sendData1_);
        FlexSendPeriodConstraint.validate(start, FlexSendData.readDuration(sendData1_));

        bytes32 orderHash = FlexEfficientHash.calc(FlexSendData.make0(_domain, msg.sender), sendData1_, FlexSendData.make2(msg.value));
        orderHash = FlexHashTree.calcBranch(orderBranch_, orderHash);

        FlexSendStateUpdate.toSent(msg.sender, FlexSendData.readGroup(sendData1_), start, orderHash);

        Address.sendValue(payable(FlexSendData.readReceiver(sendData1_)), msg.value);
    }
}
