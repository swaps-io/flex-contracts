// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexReceiveTokenFromDomain} from "../../../interfaces/views/domains/IFlexReceiveTokenFromDomain.sol";

import {IFlexReceiveTokenFrom} from "../../../interfaces/IFlexReceiveTokenFrom.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexReceiveTokenFromDomainFacet is IFlexReceiveTokenFromDomain {
    bytes8 public immutable override flexReceiveTokenFromDomain;

    constructor(address target_) {
        flexReceiveTokenFromDomain = FlexDomain.calc(target_, IFlexReceiveTokenFrom.flexReceiveTokenFrom.selector);
    }
}
