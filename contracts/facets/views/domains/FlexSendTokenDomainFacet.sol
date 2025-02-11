// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexSendTokenDomain} from "../../../interfaces/views/domains/IFlexSendTokenDomain.sol";

import {IFlexSendToken} from "../../../interfaces/IFlexSendToken.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexSendTokenDomainFacet is IFlexSendTokenDomain {
    bytes8 public immutable override flexSendTokenDomain;

    constructor(address target_) {
        flexSendTokenDomain = FlexDomain.calc(target_, IFlexSendToken.flexSendToken.selector);
    }
}
