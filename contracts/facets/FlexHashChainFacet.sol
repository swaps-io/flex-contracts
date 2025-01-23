// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexHashChain} from "../interfaces/IFlexHashChain.sol";

import {FlexHashChainStorage} from "../storages/FlexHashChainStorage.sol";

contract FlexHashChainFacet is IFlexHashChain {
    function flexHashChain(bytes32 bucket_) external view override returns (bytes32) {
        return FlexHashChainStorage.data()[bucket_];
    }
}
