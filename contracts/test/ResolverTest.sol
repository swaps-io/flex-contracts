// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

contract ResolverTest is IERC1271 {
    receive() external payable {}

    function isValidSignature(bytes32, bytes calldata) external pure returns (bytes4 magicValue) {
        return IERC1271.isValidSignature.selector;
    }

    function call(address target_, bytes calldata data_) external payable {
        Address.functionCallWithValue(target_, data_, msg.value);
    }
}
