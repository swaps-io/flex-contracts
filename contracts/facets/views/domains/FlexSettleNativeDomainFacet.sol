// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IFlexSettleNativeDomain} from "../../../interfaces/views/domains/IFlexSettleNativeDomain.sol";

import {IFlexSettleNative} from "../../../interfaces/IFlexSettleNative.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexSettleNativeDomainFacet is IFlexSettleNativeDomain {
    bytes8 public immutable override flexSettleNativeDomain;

    constructor(address target_) {
        flexSettleNativeDomain = FlexDomain.calc(target_, IFlexSettleNative.flexSettleNative.selector);
    }
}
