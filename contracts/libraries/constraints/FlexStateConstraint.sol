// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexStateError} from "../../interfaces/errors/FlexStateError.sol";

import {FlexReceiveStateAccess, FlexReceiveState} from "../accesses/FlexReceiveStateAccess.sol";

library FlexStateConstraint {
    function validate(bytes32 bucketState_, uint8 offset_, FlexReceiveState state_) internal pure {
        require(FlexReceiveStateAccess.readState(bucketState_, offset_) == state_, FlexStateError());
    }
}
