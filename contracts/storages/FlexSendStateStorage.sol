// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

library FlexSendStateStorage {
    function data() internal pure returns (mapping(bytes32 bucket => bytes32 state) storage d) {
        assembly {
            // keccak256(abi.encode(uint256(keccak256("com.swaps-io.flex.FlexSendStateStorage")) - 1)) & ~bytes32(uint256(0xff))
            d.slot := 0xa9db9766eb1152a1d5954ecac4572d31a2211af00547d4afbabfb39b0b3bdf00
        }
    }
}
