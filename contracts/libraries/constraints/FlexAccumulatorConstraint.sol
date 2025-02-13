// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexAccumulatorError} from "../../interfaces/errors/FlexAccumulatorError.sol";

import {FlexHashTree} from "../utilities/FlexHashTree.sol";

library FlexAccumulatorConstraint {
    function validate(bytes20 accumulator_, bytes32[] calldata branch_, bytes32 leaf_) internal pure {
        require(FlexHashTree.calcAccumulator(branch_, leaf_) == accumulator_, FlexAccumulatorError());
    }
}
