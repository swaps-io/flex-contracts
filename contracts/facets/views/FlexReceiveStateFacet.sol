// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexReceiveState, FlexReceiveState} from "../../interfaces/views/IFlexReceiveState.sol";

import {FlexReceiveBucketStateData} from "../../libraries/data/FlexReceiveBucketStateData.sol";

import {FlexReceiveStateBucket} from "../../libraries/storages/FlexReceiveStateBucket.sol";
import {FlexReceiveStateStorage} from "../../libraries/storages/FlexReceiveStateStorage.sol";

contract FlexReceiveStateFacet is IFlexReceiveState {
    function flexReceiveState(address receiver_, uint96 nonce_) external view override returns (FlexReceiveState) {
        bytes32 bucketState = FlexReceiveStateStorage.data()[FlexReceiveStateBucket.calcBucket(receiver_, nonce_)];
        return FlexReceiveBucketStateData.readState(bucketState, FlexReceiveStateBucket.calcOffset(nonce_));
    }
}
