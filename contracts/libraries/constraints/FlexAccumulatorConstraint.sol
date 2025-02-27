// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {FlexAccumulatorError} from "../../interfaces/errors/FlexAccumulatorError.sol";

library FlexAccumulatorConstraint {
    function validate(bytes20 accumulator_, bytes20 validAccumulator_) internal pure {
        require(accumulator_ == validAccumulator_, FlexAccumulatorError());
    }
}
