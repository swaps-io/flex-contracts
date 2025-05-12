// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {FlexMinAmountError} from "../../interfaces/errors/FlexMinAmountError.sol";

library FlexMinAmountConstraint {
    function validate(uint256 amount_, uint256 minAmount_) internal pure {
        require(amount_ >= minAmount_, FlexMinAmountError(amount_, minAmount_));
    }
}
