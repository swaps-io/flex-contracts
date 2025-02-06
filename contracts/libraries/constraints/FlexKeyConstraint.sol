// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexKeyError} from "../../interfaces/errors/FlexKeyError.sol";

library FlexKeyConstraint {
    function validate(bytes32 keyHash_, bytes32 key_) internal pure {
        require(keyHash_ == keccak256(abi.encode(key_)), FlexKeyError());
    }
}
