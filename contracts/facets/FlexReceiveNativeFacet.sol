// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import {IFlexReceiveNative} from "../interfaces/IFlexReceiveNative.sol";

import {FlexReceive} from "../interfaces/events/FlexReceive.sol";

import {FlexDeadlineConstraint} from "../libraries/constraints/FlexDeadlineConstraint.sol";
import {FlexSignatureConstraint} from "../libraries/constraints/FlexSignatureConstraint.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain} from "../libraries/utilities/FlexDomain.sol";
import {FlexEfficientHash} from "../libraries/utilities/FlexEfficientHash.sol";

contract FlexReceiveNativeFacet is IFlexReceiveNative {
    bytes32 private immutable _domain = FlexDomain.calc(IFlexReceiveNative.flexReceiveNative.selector);

    function flexReceiveNative(
        bytes32 receiveData0_, // Content: deadline (48), nonce (48), receiver (160)
        bytes32[] calldata componentBranch_,
        bytes calldata receiverSignature_
    ) external payable override {
        FlexDeadlineConstraint.validate(uint256(receiveData0_) >> 208);

        bytes32 componentHash = FlexEfficientHash.calc(receiveData0_, bytes32(msg.value));
        componentHash = FlexEfficientHash.calc(_domain | bytes32(uint256(uint160(msg.sender))), componentHash);
        bytes32 orderHash = MerkleProof.processProofCalldata(componentBranch_, componentHash);

        address receiver = address(uint160(uint256(receiveData0_)));
        FlexSignatureConstraint.validate(0, receiver, orderHash, receiverSignature_); // TODO - fix native receiver flags

        FlexReceiveStateUpdate.toReceived(receiver, uint48(uint256(receiveData0_) >> 160), orderHash);

        emit FlexReceive(orderHash);
    }
}
