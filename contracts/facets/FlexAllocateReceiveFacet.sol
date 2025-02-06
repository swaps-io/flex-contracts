// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexAllocateReceive} from "../interfaces/IFlexAllocateReceive.sol";

import {FlexReceiveStateStorage} from "../libraries/storages/FlexReceiveStateStorage.sol";

import {FlexReceiveStateAccess} from "../libraries/accesses/FlexReceiveStateAccess.sol";

import {FlexStateAllocation} from "../libraries/states/FlexStateAllocation.sol";

contract FlexAllocateReceiveFacet is IFlexAllocateReceive {
    function flexAllocateReceive(
        bytes32 allocateData0_ // Content: total buckets (48), start receiver nonce (48), receiver (160)
    ) external {
        address receiver = address(uint160(uint256(allocateData0_)));
        uint96 nonce = uint48(uint256(allocateData0_) >> 160);
        uint256 bucket = uint256(FlexReceiveStateAccess.calcBucket(receiver, nonce));
        uint256 endBucket = bucket + uint256(allocateData0_ >> 208);
        while (bucket < endBucket) {
            bytes32 bucketState = FlexReceiveStateStorage.data()[bytes32(bucket)];
            if (FlexReceiveStateAccess.readHash(bucketState) == FlexStateAllocation.UNALLOCATED_HASH) {
                bucketState = FlexReceiveStateAccess.writeHash(bucketState, FlexStateAllocation.ALLOCATED_HASH);
                FlexReceiveStateStorage.data()[bytes32(bucket)] = bucketState;
            }
            unchecked { bucket++; }
        }
    }
}
