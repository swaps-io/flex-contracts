// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexReceiveBucket} from "../../interfaces/views/IFlexReceiveBucket.sol";

import {FlexReceiveStateStorage} from "../../libraries/storages/FlexReceiveStateStorage.sol";

contract FlexReceiveBucketFacet is IFlexReceiveBucket {
    function flexReceiveBucket(bytes32 bucket_) external view override returns (bytes32) {
        return FlexReceiveStateStorage.data()[bucket_];
    }
}
