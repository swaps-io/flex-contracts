// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexRefundNativeDomainFacet} from "../../../../facets/views/domains/FlexRefundNativeDomainFacet.sol";

import {IFlexRefundNative} from "../../../../interfaces/IFlexRefundNative.sol";

import {FlexStandaloneDomain} from "../../../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexRefundNativeDomainShard is FlexRefundNativeDomainFacet {
    constructor()
        FlexRefundNativeDomainFacet(
            FlexStandaloneDomain.calc(IFlexRefundNative.flexRefundNative.selector)
        )
    {}
}
