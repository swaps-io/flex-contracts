// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexSendToken} from "../interfaces/IFlexSendToken.sol";

import {FlexSend} from "../interfaces/events/FlexSend.sol";

import {FlexCallerConstraint} from "../libraries/constraints/FlexCallerConstraint.sol";
import {FlexEarlinessConstraint} from "../libraries/constraints/FlexEarlinessConstraint.sol";
import {FlexDeadlineConstraint} from "../libraries/constraints/FlexDeadlineConstraint.sol";

import {FlexSendStateUpdate} from "../libraries/states/FlexSendStateUpdate.sol";

import {FlexDomain} from "../libraries/utilities/FlexDomain.sol";
import {FlexEfficientHash} from "../libraries/utilities/FlexEfficientHash.sol";

contract FlexSendTokenFacet is IFlexSendToken {
    bytes32 private immutable _domain = FlexDomain.calc(IFlexSendToken.flexSendToken.selector);

    function flexSendToken(
        bytes32 sendData0_, // Content: send start (48), time to send (48), sender (160)
        bytes32 sendData1_, // Content: sender group (48), nonce (48), receiver (160)
        bytes32 sendData2_, // Content: token amount (256)
        bytes32 sendData3_, // Content: <unused> (96), token (160)
        bytes32[] calldata componentBranch_
    ) external override {
        address sender = address(uint160(uint256(sendData0_)));
        FlexCallerConstraint.validate(sender);

        uint48 start = uint48(uint256(sendData0_) >> 208);
        FlexEarlinessConstraint.validate(start);

        FlexDeadlineConstraint.validate(start + uint48(uint256(sendData0_) >> 160));

        bytes32 componentHash = FlexEfficientHash.calc(_domain, sendData0_, sendData1_, sendData2_, sendData3_);
        bytes32 orderHash = MerkleProof.processProofCalldata(componentBranch_, componentHash);

        uint48 group = uint48(uint256(sendData1_) >> 208);
        FlexSendStateUpdate.toSent(sender, group, start, orderHash);

        address token = address(uint160(uint256(sendData3_)));
        address receiver = address(uint160(uint256(sendData1_)));
        SafeERC20.safeTransferFrom(IERC20(token), sender, receiver, uint256(sendData2_));

        emit FlexSend(orderHash);
    }
}
