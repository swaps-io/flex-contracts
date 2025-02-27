// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {FlexSend} from "../../interfaces/events/FlexSend.sol";

import {FlexSendChronologyConstraint} from "../constraints/FlexSendChronologyConstraint.sol";

import {FlexSendBucketStateData} from "../data/FlexSendBucketStateData.sol";
import {FlexSendAccumulatorData} from "../data/FlexSendAccumulatorData.sol";

import {FlexSendStateBucket} from "../storages/FlexSendStateBucket.sol";
import {FlexSendStateStorage} from "../storages/FlexSendStateStorage.sol";

import {FlexHashAccumulator} from "../utilities/FlexHashAccumulator.sol";

library FlexSendStateUpdate {
    function toSent(address sender_, uint96 group_, uint48 start_, bytes32 orderHash_) internal {
        bytes32 bucket = FlexSendStateBucket.calcBucket(sender_, group_);

        bytes32 bucketState = FlexSendStateStorage.data()[bucket];
        FlexSendChronologyConstraint.validate(bucketState, start_);
        bucketState = FlexSendBucketStateData.writeTime(bucketState, start_);

        bytes20 sendHash = FlexSendBucketStateData.readHash(bucketState);
        sendHash = FlexHashAccumulator.accumulate(sendHash, FlexSendAccumulatorData.make(bytes26(orderHash_), start_));
        bucketState = FlexSendBucketStateData.writeHash(bucketState, sendHash);

        FlexSendStateStorage.data()[bucket] = bucketState;
        emit FlexSend(orderHash_);
    }
}
