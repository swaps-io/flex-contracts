// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IFlexReceiveNative} from "../interfaces/IFlexReceiveNative.sol";

import {FlexDeadlineConstraint} from "../libraries/constraints/FlexDeadlineConstraint.sol";
import {FlexSignatureConstraint} from "../libraries/constraints/FlexSignatureConstraint.sol";

import {FlexReceiveData} from "../libraries/data/FlexReceiveData.sol";
import {FlexReceiveFromData} from "../libraries/data/FlexReceiveFromData.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain, FlexEfficientHash} from "../libraries/utilities/FlexDomain.sol";
import {FlexHashTree} from "../libraries/utilities/FlexHashTree.sol";

contract FlexReceiveNativeFacet is IFlexReceiveNative {
    bytes8 private immutable _domain = FlexDomain.calc(IFlexReceiveNative.flexReceiveNative.selector);

    function flexReceiveNative(bytes32 receiveData0_, bytes32[] calldata orderBranch_, bytes calldata receiverSignature_) external payable override {
        FlexDeadlineConstraint.validate(FlexReceiveData.readDeadline(receiveData0_));

        bytes32 orderHash = FlexEfficientHash.calc(receiveData0_, FlexReceiveData.make1(msg.value));
        orderHash = FlexEfficientHash.calc(FlexReceiveFromData.make0(_domain, msg.sender), FlexReceiveFromData.make1(orderHash));
        orderHash = FlexHashTree.calcBranch(orderBranch_, orderHash);

        address receiver = FlexReceiveData.readReceiver(receiveData0_);
        FlexSignatureConstraint.validate(FlexReceiveData.readSignatureFlags(receiveData0_), receiver, orderHash, receiverSignature_);

        FlexReceiveStateUpdate.toReceived(receiver, FlexReceiveData.readNonce(receiveData0_), orderHash);
    }
}
