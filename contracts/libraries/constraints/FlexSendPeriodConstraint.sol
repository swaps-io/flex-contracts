// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexEmptinessConstraint} from "./FlexEmptinessConstraint.sol";
import {FlexEarlinessConstraint} from "./FlexEarlinessConstraint.sol";
import {FlexDeadlineConstraint} from "./FlexDeadlineConstraint.sol";

library FlexSendPeriodConstraint {
    function validate(uint256 start_, uint256 duration_) internal view {
        FlexEmptinessConstraint.validate(bytes32(start_));
        FlexEarlinessConstraint.validate(start_);
        FlexDeadlineConstraint.validate(start_ + duration_);
    }
}
