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
        bytes32 receiveData0_, // Content: signer flags (2), deadline (46), nonce (48), receiver (160)
        bytes32[] calldata componentBranch_,
        bytes calldata receiverSignature_
    ) external payable override {
        FlexDeadlineConstraint.validate(uint256(receiveData0_ << 2) >> 210);

        bytes32 orderHash = FlexEfficientHash.calc(receiveData0_, bytes32(msg.value));
        orderHash = FlexEfficientHash.calc(_domain | bytes32(uint256(uint160(msg.sender))), orderHash);
        orderHash = MerkleProof.processProofCalldata(componentBranch_, orderHash);

        address receiver = address(uint160(uint256(receiveData0_)));
        FlexSignatureConstraint.validate(uint256(receiveData0_ >> 254), receiver, orderHash, receiverSignature_);

        FlexReceiveStateUpdate.toReceived(receiver, uint48(uint256(receiveData0_) >> 160), orderHash);

        emit FlexReceive(orderHash);
    }
}
