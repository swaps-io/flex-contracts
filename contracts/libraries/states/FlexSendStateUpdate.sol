// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexChronologyConstraint} from "../constraints/FlexChronologyConstraint.sol";

import {FlexSendStateStorage} from "../storages/FlexSendStateStorage.sol";

import {FlexSendStateAccess} from "../accesses/FlexSendStateAccess.sol";

import {FlexHashAccumulator} from "../utilities/FlexHashAccumulator.sol";

library FlexSendStateUpdate {
    function toSent(
        address sender_,
        uint48 group_,
        uint48 start_,
        bytes32 orderHash_
    ) internal {
        bytes32 bucket = FlexSendStateAccess.calcBucket(sender_, group_);

        bytes32 bucketState = FlexSendStateStorage.data()[bucket];
        FlexChronologyConstraint.validate(bucketState, start_);
        bucketState = FlexSendStateAccess.writeTime(bucketState, start_);

        bytes20 sendHash = FlexSendStateAccess.readHash(bucketState);
        sendHash = FlexHashAccumulator.accumulate(sendHash, orderHash_);
        bucketState = FlexSendStateAccess.writeHash(bucketState, sendHash);

        FlexSendStateStorage.data()[bucket] = bucketState;
    }
}
