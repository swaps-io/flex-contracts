// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexEfficientHash} from "./FlexEfficientHash.sol";

library FlexDomain {
    function calc(bytes4 selector_) internal view returns (bytes8) {
        return calc(address(this), selector_);
    }

    function calc(address target_, bytes4 selector_) internal view returns (bytes8) {
        uint256 data = uint256(bytes32(selector_)) | uint256(uint160(target_)) << 64 | block.chainid;
        return bytes8(FlexEfficientHash.calc(bytes32(data)));
    }
}
