// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexEarlinessError} from "../../interfaces/errors/FlexEarlinessError.sol";

library FlexEarlinessConstraint {
    function validate(uint48 start_) internal view {
        require(block.timestamp >= start_, FlexEarlinessError());
    }
}
