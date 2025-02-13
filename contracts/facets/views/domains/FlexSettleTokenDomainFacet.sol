// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexSettleTokenDomain} from "../../../interfaces/views/domains/IFlexSettleTokenDomain.sol";

import {IFlexSettleToken} from "../../../interfaces/IFlexSettleToken.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexSettleTokenDomainFacet is IFlexSettleTokenDomain {
    bytes8 public immutable override flexSettleTokenDomain;

    constructor(address target_) {
        flexSettleTokenDomain = FlexDomain.calc(target_, IFlexSettleToken.flexSettleToken.selector);
    }
}
