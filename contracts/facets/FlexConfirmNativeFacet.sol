// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IFlexConfirmNative} from "../interfaces/IFlexConfirmNative.sol";

import {FlexConfirm} from "../interfaces/events/FlexConfirm.sol";

import {FlexKeyConstraint} from "../libraries/constraints/FlexKeyConstraint.sol";

import {FlexReceiveStateUpdate} from "../libraries/states/FlexReceiveStateUpdate.sol";

import {FlexDomain} from "../libraries/utilities/FlexDomain.sol";
import {FlexEfficientHash} from "../libraries/utilities/FlexEfficientHash.sol";

contract FlexConfirmNativeFacet is IFlexConfirmNative {
    bytes32 private immutable _domain = FlexDomain.calc(IFlexConfirmNative.flexConfirmNative.selector);

    function flexConfirmNative(
        bytes32 receiveData0_, // Content: signer flags (2), deadline (46), nonce (48), receiver (160)
        bytes32 receiveData1_, // Content: amount (256)
        bytes32 confirmData0_, // Content: key hash (256)
        bytes32 confirmKey_,
        bytes32[] calldata componentBranch_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) external override {
        FlexKeyConstraint.validate(confirmData0_, confirmKey_);

        bytes32 orderHash = FlexEfficientHash.calc(receiveData0_, receiveData1_);
        orderHash = FlexEfficientHash.calc(_domain | bytes32(uint256(uint192(uint256(confirmData0_)))), orderHash);
        orderHash = MerkleProof.processProofCalldata(componentBranch_, orderHash);

        address receiver = address(uint160(uint256(receiveData0_)));
        FlexReceiveStateUpdate.toConfirmed(receiver, uint48(uint256(receiveData0_) >> 160), orderHash, receiveHashBefore_, receiveOrderHashesAfter_);

        Address.sendValue(payable(receiver), uint256(receiveData1_));

        emit FlexConfirm(orderHash);
    }
}
