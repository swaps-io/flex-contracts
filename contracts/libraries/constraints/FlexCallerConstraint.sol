// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexCallerError} from "../../interfaces/errors/FlexCallerError.sol";

library FlexCallerConstraint {
    function validate(address caller_) internal view {
        require(msg.sender == caller_, FlexCallerError());
    }
}
