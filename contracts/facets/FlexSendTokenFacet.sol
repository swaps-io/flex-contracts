// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexSendToken} from "../interfaces/IFlexSendToken.sol";

import {FlexEarlinessConstraint} from "../libraries/constraints/FlexEarlinessConstraint.sol";
import {FlexDeadlineConstraint} from "../libraries/constraints/FlexDeadlineConstraint.sol";

import {FlexSendStateUpdate} from "../libraries/states/FlexSendStateUpdate.sol";

import {FlexDomain, FlexEfficientHash} from "../libraries/utilities/FlexDomain.sol";

contract FlexSendTokenFacet is IFlexSendToken {
    bytes32 private immutable _domain = FlexDomain.calc(IFlexSendToken.flexSendToken.selector);

    function flexSendToken(
        bytes32 sendData1_, // Content: send start (48), time to send (32), sender group (16), receiver (160)
        bytes32 sendData2_, // Content: token amount (256)
        bytes32 sendData3_, // Content: <unused> (96), token (160)
        bytes32[] calldata componentBranch_
    ) external override {
        uint48 start = uint48(uint256(sendData1_) >> 208);
        FlexEarlinessConstraint.validate(start);
        FlexDeadlineConstraint.validate(start + uint32(uint256(sendData1_) >> 176));

        bytes32 orderHash = FlexEfficientHash.calc(_domain | bytes32(uint256(uint160(msg.sender))), sendData1_, sendData2_, sendData3_);
        orderHash = MerkleProof.processProofCalldata(componentBranch_, orderHash);

        FlexSendStateUpdate.toSent(msg.sender, uint16(uint256(sendData1_ >> 160)), start, orderHash);

        SafeERC20.safeTransferFrom(IERC20(address(uint160(uint256(sendData3_)))), msg.sender, address(uint160(uint256(sendData1_))), uint256(sendData2_));
    }
}
