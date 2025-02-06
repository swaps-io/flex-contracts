// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexRefundNativeDomain} from "../../../interfaces/views/domains/IFlexRefundNativeDomain.sol";

contract FlexRefundNativeDomainFacet is IFlexRefundNativeDomain {
    bytes32 public immutable override flexRefundNativeDomain;

    constructor(bytes32 domain_) {
        flexRefundNativeDomain = domain_;
    }
}
