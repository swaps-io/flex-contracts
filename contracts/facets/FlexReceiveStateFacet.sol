// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexReceiveState, FlexReceiveState} from "../interfaces/IFlexReceiveState.sol";

import {FlexReceiveStateStorage} from "../storages/FlexReceiveStateStorage.sol";
import {FlexReceiveStateAccess} from "../storages/FlexReceiveStateAccess.sol";

contract FlexReceiveStateFacet is IFlexReceiveState {
    function flexReceiveState(address receiver_, uint96 nonce_) external view override returns (FlexReceiveState) {
        bytes32 bucketState = FlexReceiveStateStorage.data()[FlexReceiveStateAccess.bucket(receiver_, nonce_)];
        uint8 offsetStateBits = FlexReceiveStateAccess.bits(bucketState, FlexReceiveStateAccess.offset(nonce_));
        return FlexReceiveState(offsetStateBits);
    }
}
