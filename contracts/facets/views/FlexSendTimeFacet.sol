// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexSendTime} from "../../interfaces/views/IFlexSendTime.sol";

import {FlexSendBucketStateData} from "../../libraries/data/FlexSendBucketStateData.sol";

import {FlexSendStateBucket} from "../../libraries/storages/FlexSendStateBucket.sol";
import {FlexSendStateStorage} from "../../libraries/storages/FlexSendStateStorage.sol";

contract FlexSendTimeFacet is IFlexSendTime {
    function flexSendTime(address sender_, uint48 group_) external view override returns (uint48) {
        bytes32 bucketState = FlexSendStateStorage.data()[FlexSendStateBucket.calcBucket(sender_, group_)];
        return FlexSendBucketStateData.readTime(bucketState);
    }
}
