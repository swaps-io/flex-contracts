// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexAccumulatorError} from "../../interfaces/errors/FlexAccumulatorError.sol";

import {FlexHashAccumulator} from "../FlexHashAccumulator.sol";

library FlexAccumulatorConstraint {
    function validate(bytes20 accumulator_, bytes20 accumulatorBefore_, bytes32 hash_, bytes32[] calldata hashesAfter_) internal pure {
        bytes20 calculatedAccumulator = FlexHashAccumulator.accumulate(accumulatorBefore_, hash_);
        calculatedAccumulator = FlexHashAccumulator.accumulateCalldata(calculatedAccumulator, hashesAfter_);
        require(calculatedAccumulator == accumulator_, FlexAccumulatorError());
    }
}
