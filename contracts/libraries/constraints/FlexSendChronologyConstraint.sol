// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexChronologyError} from "../../interfaces/errors/FlexChronologyError.sol";

import {FlexSendBucketStateData} from "../data/FlexSendBucketStateData.sol";

library FlexSendChronologyConstraint {
    function validate(bytes32 bucketState_, uint256 start_) internal pure {
        require(FlexSendBucketStateData.readTime(bucketState_) <= start_, FlexChronologyError());
    }
}
