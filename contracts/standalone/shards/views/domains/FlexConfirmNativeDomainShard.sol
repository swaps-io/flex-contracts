// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexConfirmNativeDomainFacet} from "../../../../facets/views/domains/FlexConfirmNativeDomainFacet.sol";

import {IFlexConfirmNative} from "../../../../interfaces/IFlexConfirmNative.sol";

import {FlexStandaloneDomain} from "../../../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexConfirmNativeDomainShard is FlexConfirmNativeDomainFacet {
    constructor()
        FlexConfirmNativeDomainFacet(
            FlexStandaloneDomain.calc(IFlexConfirmNative.flexConfirmNative.selector)
        )
    {}
}
