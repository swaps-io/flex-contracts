// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexEfficientHash} from "./FlexEfficientHash.sol";

library FlexStandaloneDomain {
    function calc(bytes4 selector_) internal view returns (bytes32) {
        uint256 data = uint256(bytes32(selector_)) | uint256(uint160(address(this))) << 64 | block.chainid;
        return FlexEfficientHash.calc(bytes32(data));
    }
}
