// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexConfirmNativeDomain} from "../../../interfaces/views/domains/IFlexConfirmNativeDomain.sol";

contract FlexConfirmNativeDomainFacet is IFlexConfirmNativeDomain {
    bytes32 public immutable override flexConfirmNativeDomain;

    constructor(bytes32 domain_) {
        flexConfirmNativeDomain = domain_;
    }
}
