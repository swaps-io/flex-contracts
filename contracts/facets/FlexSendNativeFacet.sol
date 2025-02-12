// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IFlexSendNative} from "../interfaces/IFlexSendNative.sol";

import {FlexEarlinessConstraint} from "../libraries/constraints/FlexEarlinessConstraint.sol";
import {FlexDeadlineConstraint} from "../libraries/constraints/FlexDeadlineConstraint.sol";

import {FlexSendStateUpdate} from "../libraries/states/FlexSendStateUpdate.sol";

import {FlexDomain} from "../libraries/utilities/FlexDomain.sol";
import {FlexEfficientHash} from "../libraries/utilities/FlexEfficientHash.sol";

contract FlexSendNativeFacet is IFlexSendNative {
    bytes32 private immutable _domain = FlexDomain.calc(IFlexSendNative.flexSendNative.selector);

    function flexSendNative(
        bytes32 sendData1_, // Content: send start (48), time to send (32), sender group (16), receiver (160)
        bytes32[] calldata componentBranch_
    ) external payable override {
        uint48 start = uint48(uint256(sendData1_) >> 208);
        FlexEarlinessConstraint.validate(start);
        FlexDeadlineConstraint.validate(start + uint32(uint256(sendData1_) >> 176));

        bytes32 orderHash = FlexEfficientHash.calc(_domain | bytes32(uint256(uint160(msg.sender))), sendData1_, bytes32(msg.value));
        orderHash = MerkleProof.processProofCalldata(componentBranch_, orderHash);

        FlexSendStateUpdate.toSent(msg.sender, uint16(uint256(sendData1_ >> 160)), start, orderHash);

        Address.sendValue(payable(address(uint160(uint256(sendData1_)))), msg.value);
    }
}
