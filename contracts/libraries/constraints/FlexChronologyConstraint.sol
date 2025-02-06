// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexChronologyError} from "../../interfaces/errors/FlexChronologyError.sol";

import {FlexSendStateAccess} from "../accesses/FlexSendStateAccess.sol";

library FlexChronologyConstraint {
    function validate(bytes32 bucketState_, uint48 start_) internal pure {
        require(FlexSendStateAccess.readTime(bucketState_) <= start_, FlexChronologyError());
    }
}
