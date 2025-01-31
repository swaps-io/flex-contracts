// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexSendNativeDomain} from "../interfaces/IFlexSendNativeDomain.sol";

contract FlexSendNativeDomainFacet is IFlexSendNativeDomain {
    bytes32 public immutable override flexSendNativeDomain;

    constructor(bytes32 domain_) {
        flexSendNativeDomain = domain_;
    }
}
