// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexAllocateSend} from "../interfaces/IFlexAllocateSend.sol";

import {FlexSendStateStorage} from "../libraries/storages/FlexSendStateStorage.sol";

import {FlexSendStateAccess} from "../libraries/accesses/FlexSendStateAccess.sol";

import {FlexStateAllocation} from "../libraries/states/FlexStateAllocation.sol";

contract FlexAllocateSendFacet is IFlexAllocateSend {
    function flexAllocateSend(
        bytes32 allocateData0_ // Content: total buckets (48), start sender group (48), sender (160)
    ) external {
        address sender = address(uint160(uint256(allocateData0_)));
        uint48 group = uint48(uint256(allocateData0_) >> 160);
        uint256 bucket = uint256(FlexSendStateAccess.calcBucket(sender, group));
        uint256 endBucket = bucket + uint256(allocateData0_ >> 208);
        while (bucket < endBucket) {
            bytes32 bucketState = FlexSendStateStorage.data()[bytes32(bucket)];
            if (FlexSendStateAccess.readHash(bucketState) == FlexStateAllocation.UNALLOCATED_HASH) {
                bucketState = FlexSendStateAccess.writeHash(bucketState, FlexStateAllocation.ALLOCATED_HASH);
                FlexSendStateStorage.data()[bytes32(bucket)] = bucketState;
            }
            unchecked { bucket++; }
        }
    }
}
