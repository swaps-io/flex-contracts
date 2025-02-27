// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

library FlexSendSaveStateStorage {
    function data() internal pure returns (mapping(bytes32 bucket => bytes32 state) storage d) {
        assembly {
            // keccak256("com.swaps-io.flex.FlexSendSaveStateStorage") & ~bytes32(uint256(0xff))
            d.slot := 0x323f1f503631a7199285ce50154a78f1e5e2ea22425e652b7e29dbcf19eb6f00
        }
    }
}
