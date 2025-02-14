// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexReceiveToken} from "../interfaces/IFlexReceiveToken.sol";

import {FlexDeadlineConstraint} from "../libraries/constraints/FlexDeadlineConstraint.sol";
import {FlexSignatureConstraint} from "../libraries/constraints/FlexSignatureConstraint.sol";

import {FlexReceiveData} from "../libraries/data/FlexReceiveData.sol";
import {FlexReceiveFromData} from "../libraries/data/FlexReceiveFromData.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain, FlexEfficientHash} from "../libraries/utilities/FlexDomain.sol";
import {FlexHashTree} from "../libraries/utilities/FlexHashTree.sol";

contract FlexReceiveTokenFacet is IFlexReceiveToken {
    bytes8 private immutable _domain = FlexDomain.calc(IFlexReceiveToken.flexReceiveToken.selector);

    function flexReceiveToken(
        bytes32 receiveData0_,
        bytes32 receiveData1_,
        bytes32 receiveData2_,
        bytes32[] calldata orderBranch_,
        bytes calldata receiverSignature_
    ) external override {
        FlexDeadlineConstraint.validate(FlexReceiveData.readDeadline(receiveData0_));

        bytes32 orderHash = FlexEfficientHash.calc(receiveData0_, receiveData1_, receiveData2_);
        orderHash = FlexEfficientHash.calc(FlexReceiveFromData.make0(_domain, msg.sender), FlexReceiveFromData.make1(orderHash));
        orderHash = FlexHashTree.calcBranch(orderBranch_, orderHash);

        address receiver = FlexReceiveData.readReceiver(receiveData0_);
        FlexSignatureConstraint.validate(FlexReceiveData.readSignatureFlags(receiveData0_), receiver, orderHash, receiverSignature_);

        FlexReceiveStateUpdate.toReceived(receiver, FlexReceiveData.readNonce(receiveData0_), orderHash);

        SafeERC20.safeTransferFrom(IERC20(FlexReceiveData.readToken(receiveData2_)), msg.sender, address(this), FlexReceiveData.readAmount(receiveData1_));
    }
}
