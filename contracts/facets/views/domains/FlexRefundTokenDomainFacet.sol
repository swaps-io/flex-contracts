// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {IFlexRefundTokenDomain} from "../../../interfaces/views/domains/IFlexRefundTokenDomain.sol";

import {IFlexRefundToken} from "../../../interfaces/IFlexRefundToken.sol";

import {FlexDomain} from "../../../libraries/utilities/FlexDomain.sol";

contract FlexRefundTokenDomainFacet is IFlexRefundTokenDomain {
    bytes8 public immutable override flexRefundTokenDomain;

    constructor(address target_) {
        flexRefundTokenDomain = FlexDomain.calc(target_, IFlexRefundToken.flexRefundToken.selector);
    }
}
