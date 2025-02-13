// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexReceiveHash} from "../../interfaces/views/IFlexReceiveHash.sol";

import {FlexReceiveBucketStateData} from "../../libraries/data/FlexReceiveBucketStateData.sol";

import {FlexReceiveStateBucket} from "../../libraries/storages/FlexReceiveStateBucket.sol";
import {FlexReceiveStateStorage} from "../../libraries/storages/FlexReceiveStateStorage.sol";

contract FlexReceiveHashFacet is IFlexReceiveHash {
    function flexReceiveHash(address receiver_, uint96 nonce_) external view override returns (bytes20) {
        bytes32 bucketState = FlexReceiveStateStorage.data()[FlexReceiveStateBucket.calcBucket(receiver_, nonce_)];
        return FlexReceiveBucketStateData.readHash(bucketState);
    }
}
