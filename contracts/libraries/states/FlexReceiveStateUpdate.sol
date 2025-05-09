// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {FlexReceive} from "../../interfaces/events/FlexReceive.sol";
import {FlexConfirm} from "../../interfaces/events/FlexConfirm.sol";
import {FlexRefund} from "../../interfaces/events/FlexRefund.sol";

import {FlexReceiveStateConstraint} from "../constraints/FlexReceiveStateConstraint.sol";
import {FlexAccumulatorConstraint} from "../constraints/FlexAccumulatorConstraint.sol";

import {FlexReceiveBucketStateData, FlexReceiveState} from "../data/FlexReceiveBucketStateData.sol";

import {FlexReceiveStateBucket} from "../storages/FlexReceiveStateBucket.sol";
import {FlexReceiveStateStorage} from "../storages/FlexReceiveStateStorage.sol";

import {FlexHashAccumulator} from "../utilities/FlexHashAccumulator.sol";

library FlexReceiveStateUpdate {
    function toReceived(address receiver_, uint96 nonce_, bytes32 orderHash_) internal {
        bytes32 bucket = FlexReceiveStateBucket.calcBucket(receiver_, nonce_);
        uint8 offset = FlexReceiveStateBucket.calcOffset(nonce_);

        bytes32 bucketState = FlexReceiveStateStorage.data()[bucket];
        FlexReceiveStateConstraint.validate(bucketState, offset, FlexReceiveState.None);
        bucketState = FlexReceiveBucketStateData.writeState(bucketState, offset, FlexReceiveState.Received);

        bytes20 receiveHash = FlexReceiveBucketStateData.readHash(bucketState);
        receiveHash = FlexHashAccumulator.accumulate(receiveHash, orderHash_);
        bucketState = FlexReceiveBucketStateData.writeHash(bucketState, receiveHash);

        FlexReceiveStateStorage.data()[bucket] = bucketState;
        emit FlexReceive(orderHash_);
    }

    function toSettled(address receiver_, uint96 nonce_, bytes32 orderHash_, bytes20 accumulator_, bool confirm_) internal {
        bytes32 bucket = FlexReceiveStateBucket.calcBucket(receiver_, nonce_);
        uint8 offset = FlexReceiveStateBucket.calcOffset(nonce_);

        bytes32 bucketState = FlexReceiveStateStorage.data()[bucket];
        FlexReceiveStateConstraint.validate(bucketState, offset, FlexReceiveState.Received);
        FlexAccumulatorConstraint.validate(accumulator_, FlexReceiveBucketStateData.readHash(bucketState));
        bucketState = FlexReceiveBucketStateData.writeState(bucketState, offset, confirm_ ? FlexReceiveState.Confirmed : FlexReceiveState.Refunded);

        FlexReceiveStateStorage.data()[bucket] = bucketState;
        if (confirm_) emit FlexConfirm(orderHash_);
        else emit FlexRefund(orderHash_);
    }
}
