// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

import {IFlexReceiveNative} from "../interfaces/IFlexReceiveNative.sol";

import {FlexDeadlineConstraint} from "../libraries/constraints/FlexDeadlineConstraint.sol";
import {FlexSignatureConstraint} from "../libraries/constraints/FlexSignatureConstraint.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain, FlexEfficientHash} from "../libraries/utilities/FlexDomain.sol";

contract FlexReceiveNativeFacet is IFlexReceiveNative {
    bytes32 private immutable _domain = FlexDomain.calc(IFlexReceiveNative.flexReceiveNative.selector);

    function flexReceiveNative(
        bytes32 receiveData0_, // Content: signer flags (2), deadline (46), nonce (48), receiver (160)
        bytes32[] calldata orderBranch_,
        bytes calldata receiverSignature_
    ) external payable override {
        FlexDeadlineConstraint.validate(uint256(receiveData0_ << 2) >> 210);

        bytes32 orderHash = FlexEfficientHash.calc(receiveData0_, bytes32(msg.value));
        orderHash = FlexEfficientHash.calc(_domain | bytes32(uint256(uint160(msg.sender))), orderHash);
        orderHash = MerkleProof.processProofCalldata(orderBranch_, orderHash);

        FlexSignatureConstraint.validate(uint256(receiveData0_ >> 254), address(uint160(uint256(receiveData0_))), orderHash, receiverSignature_);

        FlexReceiveStateUpdate.toReceived(receiveData0_, orderHash);
    }
}
