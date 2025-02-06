// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexSendHash} from "../interfaces/IFlexSendHash.sol";

import {FlexSendStateStorage} from "../libraries/storages/FlexSendStateStorage.sol";

import {FlexSendStateAccess} from "../libraries/accesses/FlexSendStateAccess.sol";

contract FlexSendHashFacet is IFlexSendHash {
    function flexSendHash(address sender_, uint48 group_) external view override returns (bytes20) {
        bytes32 bucketState = FlexSendStateStorage.data()[FlexSendStateAccess.calcBucket(sender_, group_)];
        return FlexSendStateAccess.readHash(bucketState);
    }
}
