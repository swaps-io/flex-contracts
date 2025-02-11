// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexRefundNativeDomain} from "../../../interfaces/views/domains/IFlexRefundNativeDomain.sol";

import {IFlexRefundNative} from "../../../interfaces/IFlexRefundNative.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexRefundNativeDomainFacet is IFlexRefundNativeDomain {
    bytes8 public immutable override flexRefundNativeDomain;

    constructor(address target_) {
        flexRefundNativeDomain = FlexDomain.calc(target_, IFlexRefundNative.flexRefundNative.selector);
    }
}
