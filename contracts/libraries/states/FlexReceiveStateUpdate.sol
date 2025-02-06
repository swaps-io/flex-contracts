// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexStateConstraint} from "../constraints/FlexStateConstraint.sol";
import {FlexAccumulatorConstraint} from "../constraints/FlexAccumulatorConstraint.sol";

import {FlexReceiveStateStorage} from "../storages/FlexReceiveStateStorage.sol";

import {FlexReceiveStateAccess, FlexReceiveState} from "../accesses/FlexReceiveStateAccess.sol";

import {FlexHashAccumulator} from "../FlexHashAccumulator.sol";

library FlexReceiveStateUpdate {
    function toReceived(address receiver_, uint96 nonce_, bytes32 orderHash_) internal {
        bytes32 bucket = FlexReceiveStateAccess.calcBucket(receiver_, nonce_);
        uint8 offset = FlexReceiveStateAccess.calcOffset(nonce_);

        bytes32 bucketState = FlexReceiveStateStorage.data()[bucket];
        FlexStateConstraint.validate(bucketState, offset, FlexReceiveState.None);
        bucketState = FlexReceiveStateAccess.writeState(bucketState, offset, FlexReceiveState.Received);

        bytes20 receiveHash = FlexReceiveStateAccess.readHash(bucketState);
        receiveHash = FlexHashAccumulator.accumulate(receiveHash, orderHash_);
        bucketState = FlexReceiveStateAccess.writeHash(bucketState, receiveHash);

        FlexReceiveStateStorage.data()[bucket] = bucketState;
    }

    function toConfirmed(
        address receiver_,
        uint96 nonce_,
        bytes32 orderHash_,
        bytes20 hashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) internal {
        _fromReceived(receiver_, nonce_, orderHash_, hashBefore_, receiveOrderHashesAfter_, FlexReceiveState.Confirmed);
    }

    function toRefunded(
        address receiver_,
        uint96 nonce_,
        bytes32 orderHash_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_
    ) internal {
        _fromReceived(receiver_, nonce_, orderHash_, receiveHashBefore_, receiveOrderHashesAfter_, FlexReceiveState.Refunded);
    }

    function _fromReceived(
        address receiver_,
        uint96 nonce_,
        bytes32 orderHash_,
        bytes20 receiveHashBefore_,
        bytes32[] calldata receiveOrderHashesAfter_,
        FlexReceiveState stateAfter_
    ) private {
        bytes32 bucket = FlexReceiveStateAccess.calcBucket(receiver_, nonce_);
        uint8 offset = FlexReceiveStateAccess.calcOffset(nonce_);

        bytes32 bucketState = FlexReceiveStateStorage.data()[bucket];
        FlexStateConstraint.validate(bucketState, offset, FlexReceiveState.Received);
        FlexAccumulatorConstraint.validate(FlexReceiveStateAccess.readHash(bucketState), receiveHashBefore_, orderHash_, receiveOrderHashesAfter_);

        bucketState = FlexReceiveStateAccess.writeState(bucketState, offset, stateAfter_);
        FlexReceiveStateStorage.data()[bucket] = bucketState;
    }
}
