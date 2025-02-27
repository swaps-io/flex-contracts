// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {FlexEfficientHash} from "./FlexEfficientHash.sol";

library FlexHashAccumulator {
    function accumulate(bytes20 hashBefore_, bytes32 hash_) internal pure returns (bytes20) {
        return bytes20(FlexEfficientHash.calc(hashBefore_, hash_));
    }
}
