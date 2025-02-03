// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import {IFlexRefundNative} from "../interfaces/IFlexRefundNative.sol";
import {FlexStateError} from "../interfaces/FlexStateError.sol";
import {FlexKeyError} from "../interfaces/FlexKeyError.sol";
import {FlexAccumulatorError} from "../interfaces/FlexAccumulatorError.sol";

import {FlexReceiveStateStorage} from "../storages/FlexReceiveStateStorage.sol";
import {FlexReceiveStateAccess, FlexReceiveState} from "../storages/FlexReceiveStateAccess.sol";
import {FlexHashAccumulator} from "../storages/FlexHashAccumulator.sol";

contract FlexRefundNativeFacet is IFlexRefundNative {
    bytes32 private immutable _domain;
    bytes32 private immutable _receiveDomain;

    constructor(bytes32 domain_, bytes32 receiveDomain_) {
        _domain = domain_;
        _receiveDomain = receiveDomain_;
    }

    function flexRefundNative(
        bytes32 receiveData0_, // Content: deadline (48), nonce (48), receiver (160)
        bytes32 receiveData1_, // Content: amount (256)
        bytes32 refundData0_, // Content: key hash (256)
        bytes32 refundData1_, // Content: <unused> (96), refund receiver (160)
        bytes32 refundKey_,
        bytes32[] calldata componentBranch_,
        bool[] calldata componentFlags_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) external override {
        require(refundData0_ == keccak256(abi.encode(refundKey_)), FlexKeyError());

        bytes32[] memory componentHashes = new bytes32[](2);
        componentHashes[0] = keccak256(abi.encode(_receiveDomain, receiveData0_, receiveData1_)); // Receive native component
        componentHashes[1] = keccak256(abi.encode(_domain, refundData0_, refundData1_)); // Refund native component
        bytes32 orderHash = MerkleProof.processMultiProofCalldata(componentBranch_, componentFlags_, componentHashes);

        address receiver = address(uint160(uint256(receiveData0_)));
        uint96 nonce = uint48(uint256(receiveData0_) >> 160);
        bytes32 bucket = FlexReceiveStateAccess.calcBucket(receiver, nonce);
        uint8 offset = FlexReceiveStateAccess.calcOffset(nonce);
        bytes32 bucketState = FlexReceiveStateStorage.data()[bucket];
        require(FlexReceiveStateAccess.readState(bucketState, offset) == FlexReceiveState.Received, FlexStateError());

        bytes20 receiveHash = FlexHashAccumulator.accumulate(receiveHashBefore_, orderHash);
        receiveHash = FlexHashAccumulator.accumulateCalldata(receiveHash, receiveOrderHashesAfter_);
        require(receiveHash == FlexReceiveStateAccess.readHash(bucketState), FlexAccumulatorError());

        bucketState = FlexReceiveStateAccess.writeState(bucketState, offset, FlexReceiveState.Refunded);
        FlexReceiveStateStorage.data()[bucket] = bucketState;

        receiver = address(uint160(uint256(refundData1_)));
        Address.sendValue(payable(receiver), uint256(receiveData1_));

        emit FlexRefundNative(orderHash);
    }
}
