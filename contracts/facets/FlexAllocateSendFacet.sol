// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IFlexAllocateSend} from "../interfaces/IFlexAllocateSend.sol";

import {FlexSendAllocateData} from "../libraries/data/FlexSendAllocateData.sol";
import {FlexSendBucketStateData} from "../libraries/data/FlexSendBucketStateData.sol";

import {FlexSendStateBucket} from "../libraries/storages/FlexSendStateBucket.sol";
import {FlexSendStateStorage} from "../libraries/storages/FlexSendStateStorage.sol";

import {FlexStateAllocation} from "../libraries/states/FlexStateAllocation.sol";

contract FlexAllocateSendFacet is IFlexAllocateSend {
    function flexAllocateSend(bytes32 allocateData0_) external {
        uint256 bucket = uint256(FlexSendStateBucket.calcBucket(FlexSendAllocateData.readSender(allocateData0_), FlexSendAllocateData.readStartGroup(allocateData0_)));
        uint256 endBucket = bucket + FlexSendAllocateData.readTotalBuckets(allocateData0_);
        for (; bucket < endBucket; bucket++) {
            bytes32 bucketState = FlexSendStateStorage.data()[bytes32(bucket)];
            if (FlexSendBucketStateData.readHash(bucketState) == FlexStateAllocation.UNALLOCATED_HASH) {
                bucketState = FlexSendBucketStateData.writeHash(bucketState, FlexStateAllocation.ALLOCATED_HASH);
                FlexSendStateStorage.data()[bytes32(bucket)] = bucketState;
            }
        }
    }
}
