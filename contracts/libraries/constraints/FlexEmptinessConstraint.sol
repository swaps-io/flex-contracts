// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {FlexEmptinessError} from "../../interfaces/errors/FlexEmptinessError.sol";

library FlexEmptinessConstraint {
    function validate(bytes32 value_) internal pure {
        require(value_ != 0, FlexEmptinessError());
    }
}
