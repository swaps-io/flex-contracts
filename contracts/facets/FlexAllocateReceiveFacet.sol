// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexAllocateReceive} from "../interfaces/IFlexAllocateReceive.sol";

import {FlexReceiveAllocateData} from "../libraries/data/FlexReceiveAllocateData.sol";
import {FlexReceiveBucketStateData} from "../libraries/data/FlexReceiveBucketStateData.sol";

import {FlexReceiveStateBucket} from "../libraries/storages/FlexReceiveStateBucket.sol";
import {FlexReceiveStateStorage} from "../libraries/storages/FlexReceiveStateStorage.sol";

import {FlexStateAllocation} from "../libraries/states/FlexStateAllocation.sol";

contract FlexAllocateReceiveFacet is IFlexAllocateReceive {
    function flexAllocateReceive(bytes32 allocateData0_) external {
        uint256 bucket = uint256(FlexReceiveStateBucket.calcBucket(FlexReceiveAllocateData.readReceiver(allocateData0_), FlexReceiveAllocateData.readStartNonce(allocateData0_)));
        uint256 endBucket = bucket + FlexReceiveAllocateData.readTotalBuckets(allocateData0_);
        for (; bucket < endBucket; bucket++) {
            bytes32 bucketState = FlexReceiveStateStorage.data()[bytes32(bucket)];
            if (FlexReceiveBucketStateData.readHash(bucketState) == FlexStateAllocation.UNALLOCATED_HASH) {
                bucketState = FlexReceiveBucketStateData.writeHash(bucketState, FlexStateAllocation.ALLOCATED_HASH);
                FlexReceiveStateStorage.data()[bytes32(bucket)] = bucketState;
            }
        }
    }
}
