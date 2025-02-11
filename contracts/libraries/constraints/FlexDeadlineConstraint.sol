// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexDeadlineError} from "../../interfaces/errors/FlexDeadlineError.sol";

library FlexDeadlineConstraint {
    function validate(uint256 deadline_) internal view {
        require(block.timestamp <= deadline_, FlexDeadlineError());
    }
}
