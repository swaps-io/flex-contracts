// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexSendTokenFloat} from "../interfaces/IFlexSendTokenFloat.sol";

import {FlexSendAmount} from "../interfaces/events/FlexSendAmount.sol";
import {FlexSendFloatData} from "../libraries/data/FlexSendFloatData.sol";

import {FlexDeadlineConstraint} from "../libraries/constraints/FlexDeadlineConstraint.sol";
import {FlexAmountConstraint} from "../libraries/constraints/FlexAmountConstraint.sol";

import {FlexSendData} from "../libraries/data/FlexSendData.sol";

import {FlexSendStateUpdate} from "../libraries/states/FlexSendStateUpdate.sol";

import {FlexDomain, FlexEfficientHash} from "../libraries/utilities/FlexDomain.sol";
import {FlexHashTree} from "../libraries/utilities/FlexHashTree.sol";

contract FlexSendTokenFloatFacet is IFlexSendTokenFloat {
    bytes8 private immutable _domain = FlexDomain.calc(IFlexSendTokenFloat.flexSendTokenFloat.selector);

    function flexSendTokenFloat(
        bytes32 sendData1_,
        bytes32 sendData2_,
        bytes32 sendData3_,
        uint256 amount_,
        bytes32[] calldata orderBranch_
    ) external override {
        FlexDeadlineConstraint.validate(FlexSendData.readDeadline(sendData1_));
        FlexAmountConstraint.validate(amount_, FlexSendFloatData.readAmount(sendData2_));

        bytes32 orderHash = FlexEfficientHash.calc(FlexSendData.make0(_domain, msg.sender), sendData1_, sendData2_, sendData3_);
        orderHash = FlexHashTree.calcBranch(orderBranch_, orderHash);

        FlexSendStateUpdate.toSent(msg.sender, FlexSendData.readNonce(sendData1_), orderHash);
        if (FlexSendFloatData.readEmitAmount(sendData2_)) emit FlexSendAmount(orderHash, amount_);

        SafeERC20.safeTransferFrom(IERC20(FlexSendData.readToken(sendData3_)), msg.sender, FlexSendData.readReceiver(sendData1_), amount_);
    }
}
