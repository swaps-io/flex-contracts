// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IFlexSendHash} from "../../interfaces/views/IFlexSendHash.sol";

import {FlexSendBucketStateData} from "../../libraries/data/FlexSendBucketStateData.sol";

import {FlexSendStateBucket} from "../../libraries/storages/FlexSendStateBucket.sol";
import {FlexSendStateStorage} from "../../libraries/storages/FlexSendStateStorage.sol";

contract FlexSendHashFacet is IFlexSendHash {
    function flexSendHash(address sender_, uint48 group_) external view override returns (bytes20) {
        bytes32 bucketState = FlexSendStateStorage.data()[FlexSendStateBucket.calcBucket(sender_, group_)];
        return FlexSendBucketStateData.readHash(bucketState);
    }
}
