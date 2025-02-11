// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexRefundTokenDomainFacet} from "../../../../facets/views/domains/FlexRefundTokenDomainFacet.sol";

import {IFlexRefundToken} from "../../../../interfaces/IFlexRefundToken.sol";

import {FlexStandaloneDomain} from "../../../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexRefundTokenDomainShard is FlexRefundTokenDomainFacet {
    constructor()
        FlexRefundTokenDomainFacet(
            FlexStandaloneDomain.calc(IFlexRefundToken.flexRefundToken.selector)
        )
    {}
}
