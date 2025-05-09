// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {FlexKeyError} from "../../interfaces/errors/FlexKeyError.sol";

import {FlexEfficientHash} from "../utilities/FlexEfficientHash.sol";

library FlexKeyConstraint {
    function validate(bytes32 keyHash_, bytes32 key_) internal pure {
        require(keyHash_ == FlexEfficientHash.calc(key_), FlexKeyError());
    }
}
