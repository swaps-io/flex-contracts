// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexSendTime} from "../interfaces/IFlexSendTime.sol";

import {FlexSendStateStorage} from "../libraries/storages/FlexSendStateStorage.sol";

import {FlexSendStateAccess} from "../libraries/accesses/FlexSendStateAccess.sol";

contract FlexSendTimeFacet is IFlexSendTime {
    function flexSendTime(address sender_, uint48 group_) external view override returns (uint48) {
        bytes32 bucketState = FlexSendStateStorage.data()[FlexSendStateAccess.calcBucket(sender_, group_)];
        return FlexSendStateAccess.readTime(bucketState);
    }
}
