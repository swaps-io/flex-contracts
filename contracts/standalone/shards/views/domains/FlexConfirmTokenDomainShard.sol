// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexConfirmTokenDomainFacet} from "../../../../facets/views/domains/FlexConfirmTokenDomainFacet.sol";

import {IFlexConfirmToken} from "../../../../interfaces/IFlexConfirmToken.sol";

import {FlexStandaloneDomain} from "../../../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexConfirmTokenDomainShard is FlexConfirmTokenDomainFacet {
    constructor()
        FlexConfirmTokenDomainFacet(
            FlexStandaloneDomain.calc(IFlexConfirmToken.flexConfirmToken.selector)
        )
    {}
}
