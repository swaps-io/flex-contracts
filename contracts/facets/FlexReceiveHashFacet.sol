// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexReceiveHash} from "../interfaces/IFlexReceiveHash.sol";

import {FlexReceiveStateStorage} from "../libraries/storages/FlexReceiveStateStorage.sol";

import {FlexReceiveStateAccess} from "../libraries/accesses/FlexReceiveStateAccess.sol";

contract FlexReceiveHashFacet is IFlexReceiveHash {
    function flexReceiveHash(address receiver_, uint96 nonce_) external view override returns (bytes20) {
        bytes32 bucketState = FlexReceiveStateStorage.data()[FlexReceiveStateAccess.calcBucket(receiver_, nonce_)];
        return FlexReceiveStateAccess.readHash(bucketState);
    }
}
