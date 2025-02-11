// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexConfirmTokenDomain} from "../../../interfaces/views/domains/IFlexConfirmTokenDomain.sol";

import {IFlexConfirmToken} from "../../../interfaces/IFlexConfirmToken.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexConfirmTokenDomainFacet is IFlexConfirmTokenDomain {
    bytes8 public immutable override flexConfirmTokenDomain;

    constructor(address target_) {
        flexConfirmTokenDomain = FlexDomain.calc(target_, IFlexConfirmToken.flexConfirmToken.selector);
    }
}
