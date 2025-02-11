// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexReceiveTokenDomainFacet} from "../../../../facets/views/domains/FlexReceiveTokenDomainFacet.sol";

import {IFlexReceiveToken} from "../../../../interfaces/IFlexReceiveToken.sol";

import {FlexStandaloneDomain} from "../../../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexReceiveTokenDomainShard is FlexReceiveTokenDomainFacet {
    constructor()
        FlexReceiveTokenDomainFacet(
            FlexStandaloneDomain.calc(IFlexReceiveToken.flexReceiveToken.selector)
        )
    {}
}
