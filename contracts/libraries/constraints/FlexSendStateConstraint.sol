// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {FlexStateError} from "../../interfaces/errors/FlexStateError.sol";

import {FlexSendBucketStateData, FlexSendState} from "../data/FlexSendBucketStateData.sol";

library FlexSendStateConstraint {
    function validate(bytes32 bucketState_, uint8 offset_, FlexSendState state_) internal pure {
        require(FlexSendBucketStateData.readState(bucketState_, offset_) == state_, FlexStateError());
    }
}
