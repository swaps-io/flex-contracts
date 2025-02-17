// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexPreserveSendStateStorage {
    function data() internal pure returns (mapping(bytes32 bucket => bytes32 state) storage d) {
        assembly {
            // keccak256("com.swaps-io.flex.FlexPreserveSendStateStorage") & ~bytes32(uint256(0xff))
            d.slot := 0x45d7860e5ab51180a8367b6aa8e7352f1c8ea069c083fae3558f3d05172dea00
        }
    }
}
