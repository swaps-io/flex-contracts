// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexReceiveNativeDomain} from "../interfaces/IFlexReceiveNativeDomain.sol";

contract FlexReceiveNativeDomainFacet is IFlexReceiveNativeDomain {
    bytes32 public immutable override flexReceiveNativeDomain;

    constructor(bytes32 domain_) {
        flexReceiveNativeDomain = domain_;
    }
}
