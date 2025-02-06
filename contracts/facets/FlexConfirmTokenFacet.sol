// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IFlexConfirmToken} from "../interfaces/IFlexConfirmToken.sol";

import {FlexKeyError} from "../interfaces/errors/FlexKeyError.sol";
import {FlexStateError} from "../interfaces/errors/FlexStateError.sol";
import {FlexAccumulatorError} from "../interfaces/errors/FlexAccumulatorError.sol";

import {FlexConfirm} from "../interfaces/events/FlexConfirm.sol";

import {FlexReceiveStateStorage} from "../storages/FlexReceiveStateStorage.sol";
import {FlexReceiveStateAccess, FlexReceiveState} from "../storages/FlexReceiveStateAccess.sol";
import {FlexHashAccumulator} from "../storages/FlexHashAccumulator.sol";

contract FlexConfirmTokenFacet is IFlexConfirmToken {
    bytes32 private immutable _domain;
    bytes32 private immutable _receiveDomain;

    constructor(bytes32 domain_, bytes32 receiveDomain_) {
        _domain = domain_;
        _receiveDomain = receiveDomain_;
    }

    function flexConfirmToken(
        bytes32 receiveData0_, // Content: deadline (48), nonce (48), receiver (160)
        bytes32 receiveData1_, // Content: token amount (256)
        bytes32 receiveData2_, // Content: <unused> (96), token (160)
        bytes32 confirmData0_, // Content: key hash (256)
        bytes32 confirmKey_,
        bytes32[] calldata componentBranch_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) external override {
        require(confirmData0_ == keccak256(abi.encode(confirmKey_)), FlexKeyError());

        bytes32 componentHash = keccak256(abi.encode(_receiveDomain, receiveData0_, receiveData1_, receiveData2_));
        componentHash = keccak256(abi.encode(_domain, confirmData0_, componentHash));
        bytes32 orderHash = MerkleProof.processProofCalldata(componentBranch_, componentHash);

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

        address token = address(uint160(uint256(receiveData2_)));
        SafeERC20.safeTransfer(IERC20(token), receiver, uint256(receiveData1_));

        emit FlexConfirm(orderHash);
    }
}
