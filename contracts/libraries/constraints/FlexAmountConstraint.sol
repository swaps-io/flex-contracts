// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexAmountError} from "../../interfaces/errors/FlexAmountError.sol";

library FlexAmountConstraint {
    function validate(uint256 amount_, uint256 minAmount_) internal pure {
        require(amount_ >= minAmount_, FlexAmountError());
    }
}
