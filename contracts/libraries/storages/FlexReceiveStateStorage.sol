// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

library FlexReceiveStateStorage {
    function data() internal pure returns (mapping(bytes32 bucket => bytes32 state) storage d) {
        assembly {
            // keccak256("com.swaps-io.flex.FlexReceiveStateStorage") & ~bytes32(uint256(0xff))
            d.slot := 0xbdc9d446a12e6027b20b648f60cb0719a85ec0689478a6e0ff8c8ee6155e9f00
        }
    }
}
