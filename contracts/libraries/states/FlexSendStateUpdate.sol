// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {FlexSend} from "../../interfaces/events/FlexSend.sol";

import {FlexSendStateConstraint} from "../constraints/FlexSendStateConstraint.sol";

import {FlexSendBucketStateData, FlexSendState} from "../data/FlexSendBucketStateData.sol";

import {FlexSendStateBucket} from "../storages/FlexSendStateBucket.sol";
import {FlexSendStateStorage} from "../storages/FlexSendStateStorage.sol";

import {FlexHashAccumulator} from "../utilities/FlexHashAccumulator.sol";

library FlexSendStateUpdate {
    function toSent(address sender_, uint96 nonce_, bytes32 orderHash_) internal {
        bytes32 bucket = FlexSendStateBucket.calcBucket(sender_, nonce_);
        uint8 offset = FlexSendStateBucket.calcOffset(nonce_);

        bytes32 bucketState = FlexSendStateStorage.data()[bucket];
        FlexSendStateConstraint.validate(bucketState, offset, FlexSendState.None);
        bucketState = FlexSendBucketStateData.writeStateSent(bucketState, offset);

        bytes20 sendHash = FlexSendBucketStateData.readHash(bucketState);
        sendHash = FlexHashAccumulator.accumulate(sendHash, orderHash_);
        bucketState = FlexSendBucketStateData.writeHash(bucketState, sendHash);

        FlexSendStateStorage.data()[bucket] = bucketState;
        emit FlexSend(orderHash_);
    }
}
