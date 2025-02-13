// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexSendToken} from "../interfaces/IFlexSendToken.sol";

import {FlexEarlinessConstraint} from "../libraries/constraints/FlexEarlinessConstraint.sol";
import {FlexDeadlineConstraint} from "../libraries/constraints/FlexDeadlineConstraint.sol";

import {FlexSendData} from "../libraries/data/FlexSendData.sol";

import {FlexSendStateUpdate} from "../libraries/states/FlexSendStateUpdate.sol";

import {FlexDomain, FlexEfficientHash} from "../libraries/utilities/FlexDomain.sol";

contract FlexSendTokenFacet is IFlexSendToken {
    bytes8 private immutable _domain = FlexDomain.calc(IFlexSendToken.flexSendToken.selector);

    function flexSendToken(bytes32 sendData1_, bytes32 sendData2_, bytes32 sendData3_, bytes32[] calldata orderBranch_) external override {
        uint48 start = FlexSendData.readStart(sendData1_);
        FlexEarlinessConstraint.validate(start);
        FlexDeadlineConstraint.validate(start + FlexSendData.readTime(sendData1_));

        bytes32 orderHash = FlexEfficientHash.calc(FlexSendData.make0(_domain, msg.sender), sendData1_, sendData2_, sendData3_);
        orderHash = MerkleProof.processProofCalldata(orderBranch_, orderHash);

        FlexSendStateUpdate.toSent(msg.sender, FlexSendData.readGroup(sendData1_), start, orderHash);

        SafeERC20.safeTransferFrom(IERC20(FlexSendData.readToken(sendData3_)), msg.sender, FlexSendData.readReceiver(sendData1_), FlexSendData.readAmount(sendData2_));
    }
}
