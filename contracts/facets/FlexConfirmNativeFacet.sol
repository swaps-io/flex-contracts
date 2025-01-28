// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IFlexConfirmNative} from "../interfaces/IFlexConfirmNative.sol";
import {FlexStateError} from "../interfaces/FlexStateError.sol";
import {FlexKeyError} from "../interfaces/FlexKeyError.sol";
import {FlexAccumulatorError} from "../interfaces/FlexAccumulatorError.sol";

import {FlexReceiveStateStorage} from "../storages/FlexReceiveStateStorage.sol";
import {FlexReceiveStateAccess, FlexReceiveState} from "../storages/FlexReceiveStateAccess.sol";
import {FlexHashAccumulator} from "../storages/FlexHashAccumulator.sol";

contract FlexConfirmNativeFacet is IFlexConfirmNative {
    bytes32 private immutable _domain;
    bytes32 private immutable _receiveDomain;

    constructor(bytes32 domain_, bytes32 receiveDomain_) {
        _domain = domain_;
        _receiveDomain = receiveDomain_;
    }

    function flexConfirmNative(
        bytes32 receiveData0_, // Content: deadline (48), nonce (48), receiver (160)
        bytes32 receiveData1_, // Content: amount (256)
        bytes32 confirmData0_, // Content: key hash (256)
        bytes32 confirmKey_,
        bytes32[] calldata componentBranch_,
        bool[] calldata componentBranchFlags_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) external override {
        require(confirmData0_ == keccak256(abi.encode(confirmKey_)), FlexKeyError());

        bytes32[] memory componentHashes = new bytes32[](2);
        componentHashes[0] = keccak256(abi.encode(_receiveDomain, receiveData0_, receiveData1_)); // Receive native component
        componentHashes[1] = keccak256(abi.encode(_domain, confirmData0_)); // Confirm native component
        bytes32 orderHash = MerkleProof.processMultiProofCalldata(componentBranch_, componentBranchFlags_, componentHashes);

        address receiver = address(uint160(uint256(receiveData0_)));
        uint96 nonce = uint48(uint256(receiveData0_) >> 160);
        bytes32 bucket = FlexReceiveStateAccess.calcBucket(receiver, nonce);
        uint8 offset = FlexReceiveStateAccess.calcOffset(nonce);
        bytes32 bucketState = FlexReceiveStateStorage.data()[bucket];
        require(FlexReceiveStateAccess.readState(bucketState, offset) == FlexReceiveState.Received, FlexStateError());

        bytes20 receiveHash = FlexHashAccumulator.accumulate(receiveHashBefore_, orderHash);
        receiveHash = FlexHashAccumulator.accumulateCalldata(receiveHash, receiveOrderHashesAfter_);
        require(receiveHash == FlexReceiveStateAccess.readHash(bucketState), FlexAccumulatorError());

        bucketState = FlexReceiveStateAccess.writeState(bucketState, offset, FlexReceiveState.Confirmed);
        FlexReceiveStateStorage.data()[bucket] = bucketState;

        Address.sendValue(payable(receiver), uint256(receiveData1_));

        emit FlexConfirmNative(orderHash);
    }
}
