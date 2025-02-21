// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexSaveSendStateStorage {
    function data() internal pure returns (mapping(bytes32 bucket => bytes32 state) storage d) {
        assembly {
            // keccak256("com.swaps-io.flex.FlexSaveSendStateStorage") & ~bytes32(uint256(0xff))
            d.slot := 0xc5a64bb628d6f3ba95467523daa98809034dbe9decdd7179f3a42efc85e65700
        }
    }
}
