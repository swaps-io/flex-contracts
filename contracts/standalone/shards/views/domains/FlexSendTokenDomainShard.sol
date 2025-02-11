// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexSendTokenDomainFacet} from "../../../../facets/views/domains/FlexSendTokenDomainFacet.sol";

import {IFlexSendToken} from "../../../../interfaces/IFlexSendToken.sol";

import {FlexStandaloneDomain} from "../../../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexSendTokenDomainShard is FlexSendTokenDomainFacet {
    constructor()
        FlexSendTokenDomainFacet(
            FlexStandaloneDomain.calc(IFlexSendToken.flexSendToken.selector)
        )
    {}
}
