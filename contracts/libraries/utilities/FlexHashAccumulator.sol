// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexEfficientHash} from "./FlexEfficientHash.sol";

library FlexHashAccumulator {
    function accumulate(bytes32 hashBefore_, bytes32 hash_) internal pure returns (bytes20) {
        return bytes20(FlexEfficientHash.calc(hashBefore_, hash_));
    }
}
