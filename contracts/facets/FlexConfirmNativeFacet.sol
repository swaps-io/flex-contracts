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
    bytes8 private immutable _domain = FlexDomain.calc(IFlexConfirmNative.flexConfirmNative.selector);

    function flexConfirmNative(
        bytes32 receiveData0_, // Content: deadline (48), nonce (40), receiver flags (8), receiver (160)
        bytes32 receiveData1_, // Content: amount (256)
        bytes32 receiveData2_, // Content: <unused> (96), sender (160)
        bytes32 confirmData0_, // Content: key hash (256)
        bytes32 confirmKey_,
        bytes32[] calldata componentBranch_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) external override {
        FlexKeyConstraint.validate(confirmData0_, confirmKey_);

        bytes32 componentHash = FlexEfficientHash.calc(receiveData0_, receiveData1_, receiveData2_);
        componentHash = FlexEfficientHash.calc(_domain, confirmData0_, componentHash);
        bytes32 orderHash = MerkleProof.processProofCalldata(componentBranch_, componentHash);

        address receiver = address(uint160(uint256(receiveData0_)));
        uint96 nonce = uint40(uint256(receiveData0_) >> 168);
        FlexReceiveStateUpdate.toConfirmed(receiver, nonce, orderHash, receiveHashBefore_, receiveOrderHashesAfter_);

        Address.sendValue(payable(receiver), uint256(receiveData1_));

        emit FlexConfirm(orderHash);
    }
}
