// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexSendNativeDomain} from "../../../interfaces/views/domains/IFlexSendNativeDomain.sol";

import {IFlexSendNative} from "../../../interfaces/IFlexSendNative.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexSendNativeDomainFacet is IFlexSendNativeDomain {
    bytes8 public immutable override flexSendNativeDomain;

    constructor(address target_) {
        flexSendNativeDomain = FlexDomain.calc(target_, IFlexSendNative.flexSendNative.selector);
    }
}
