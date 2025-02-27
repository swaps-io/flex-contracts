// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IFlexSendNativeFloatDomain} from "../../../interfaces/views/domains/IFlexSendNativeFloatDomain.sol";

import {IFlexSendNativeFloat} from "../../../interfaces/IFlexSendNativeFloat.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexSendNativeFloatDomainFacet is IFlexSendNativeFloatDomain {
    bytes8 public immutable override flexSendNativeFloatDomain;

    constructor(address target_) {
        flexSendNativeFloatDomain = FlexDomain.calc(target_, IFlexSendNativeFloat.flexSendNativeFloat.selector);
    }
}
