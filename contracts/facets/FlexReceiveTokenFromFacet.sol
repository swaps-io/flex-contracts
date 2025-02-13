// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexReceiveTokenFrom} from "../interfaces/IFlexReceiveTokenFrom.sol";

import {FlexDeadlineConstraint} from "../libraries/constraints/FlexDeadlineConstraint.sol";
import {FlexSignatureConstraint} from "../libraries/constraints/FlexSignatureConstraint.sol";

import {FlexReceiveData} from "../libraries/data/FlexReceiveData.sol";
import {FlexReceiveFromData} from "../libraries/data/FlexReceiveFromData.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain, FlexEfficientHash} from "../libraries/utilities/FlexDomain.sol";

contract FlexReceiveTokenFromFacet is IFlexReceiveTokenFrom {
    bytes8 private immutable _domain = FlexDomain.calc(IFlexReceiveTokenFrom.flexReceiveTokenFrom.selector);

    function flexReceiveTokenFrom(
        bytes32 receiveFromData0_,
        bytes32 receiveData1_,
        bytes32 receiveData2_,
        bytes32[] calldata orderBranch_,
        bytes calldata senderSignature_
    ) external override {
        FlexDeadlineConstraint.validate(FlexReceiveData.readDeadline(receiveFromData0_));

        address sender = FlexReceiveData.readReceiver(receiveFromData0_);

        bytes32 orderHash = FlexEfficientHash.calc(FlexReceiveData.writeReceiver(receiveFromData0_, msg.sender), receiveData1_, receiveData2_);
        orderHash = FlexEfficientHash.calc(FlexReceiveFromData.make0(_domain, sender), FlexReceiveFromData.make1(orderHash));
        orderHash = MerkleProof.processProofCalldata(orderBranch_, orderHash);

        FlexSignatureConstraint.validate(FlexReceiveData.readSignFlags(receiveFromData0_), sender, orderHash, senderSignature_);

        FlexReceiveStateUpdate.toReceived(msg.sender, FlexReceiveData.readNonce(receiveFromData0_), orderHash);

        SafeERC20.safeTransferFrom(IERC20(FlexReceiveData.readToken(receiveData2_)), sender, address(this), FlexReceiveData.readAmount(receiveData1_));
    }
}
