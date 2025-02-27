// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.26;

import {IFlexSendTokenFloatDomain} from "../../../interfaces/views/domains/IFlexSendTokenFloatDomain.sol";

import {IFlexSendTokenFloat} from "../../../interfaces/IFlexSendTokenFloat.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexSendTokenFloatDomainFacet is IFlexSendTokenFloatDomain {
    bytes8 public immutable override flexSendTokenFloatDomain;

    constructor(address target_) {
        flexSendTokenFloatDomain = FlexDomain.calc(target_, IFlexSendTokenFloat.flexSendTokenFloat.selector);
    }
}
