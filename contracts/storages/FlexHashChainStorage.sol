// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexHashChainStorage {
    function data() internal pure returns (mapping(bytes32 bucket => bytes32) storage d) {
        assembly {
            // keccak256(abi.encode(uint256(keccak256("com.swaps-io.flex.FlexHashChainStorage")) - 1)) & ~bytes32(uint256(0xff))
            d.slot := 0xb011d90d5a65d73f9db55881bf5a783e72ff33d13ae46dcae23bc8f612029a00
        }
    }
}
