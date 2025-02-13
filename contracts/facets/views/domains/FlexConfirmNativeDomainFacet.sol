// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexConfirmNativeDomain} from "../../../interfaces/views/domains/IFlexConfirmNativeDomain.sol";

import {IFlexConfirmNative} from "../../../interfaces/IFlexConfirmNative.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexConfirmNativeDomainFacet is IFlexConfirmNativeDomain {
    bytes8 public immutable override flexConfirmNativeDomain;

    constructor(address target_) {
        flexConfirmNativeDomain = FlexDomain.calc(target_, IFlexConfirmNative.flexConfirmNative.selector);
    }
}
