// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexReceiveState, FlexReceiveState} from "../../interfaces/views/IFlexReceiveState.sol";

import {FlexReceiveStateStorage} from "../../libraries/storages/FlexReceiveStateStorage.sol";

import {FlexReceiveStateAccess} from "../../libraries/accesses/FlexReceiveStateAccess.sol";

contract FlexReceiveStateFacet is IFlexReceiveState {
    function flexReceiveState(address receiver_, uint96 nonce_) external view override returns (FlexReceiveState) {
        bytes32 bucketState = FlexReceiveStateStorage.data()[FlexReceiveStateAccess.calcBucket(receiver_, nonce_)];
        return FlexReceiveStateAccess.readState(bucketState, FlexReceiveStateAccess.calcOffset(nonce_));
    }
}
