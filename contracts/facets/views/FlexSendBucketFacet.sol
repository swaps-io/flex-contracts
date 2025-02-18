// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexSendBucket} from "../../interfaces/views/IFlexSendBucket.sol";

import {FlexSendStateStorage} from "../../libraries/storages/FlexSendStateStorage.sol";

contract FlexSendBucketFacet is IFlexSendBucket {
    function flexSendBucket(bytes32 bucket_) external view override returns (bytes32) {
        return FlexSendStateStorage.data()[bucket_];
    }
}
