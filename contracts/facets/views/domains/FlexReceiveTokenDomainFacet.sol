// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexReceiveTokenDomain} from "../../../interfaces/views/domains/IFlexReceiveTokenDomain.sol";

import {IFlexReceiveToken} from "../../../interfaces/IFlexReceiveToken.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexReceiveTokenDomainFacet is IFlexReceiveTokenDomain {
    bytes8 public immutable override flexReceiveTokenDomain;

    constructor(address target_) {
        flexReceiveTokenDomain = FlexDomain.calc(target_, IFlexReceiveToken.flexReceiveToken.selector);
    }
}
