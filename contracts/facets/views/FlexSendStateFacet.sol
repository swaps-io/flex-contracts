// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IFlexSendState, FlexSendState} from "../../interfaces/views/IFlexSendState.sol";

import {FlexSendBucketStateData} from "../../libraries/data/FlexSendBucketStateData.sol";

import {FlexSendStateBucket} from "../../libraries/storages/FlexSendStateBucket.sol";
import {FlexSendStateStorage} from "../../libraries/storages/FlexSendStateStorage.sol";

contract FlexSendStateFacet is IFlexSendState {
    function flexSendState(address sender_, uint96 nonce_) external view override returns (FlexSendState) {
        bytes32 bucketState = FlexSendStateStorage.data()[FlexSendStateBucket.calcBucket(sender_, nonce_)];
        return FlexSendBucketStateData.readState(bucketState, FlexSendStateBucket.calcOffset(nonce_));
    }
}
