// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexSendNativeDomainFacet} from "../../../../facets/views/domains/FlexSendNativeDomainFacet.sol";

import {IFlexSendNative} from "../../../../interfaces/IFlexSendNative.sol";

import {FlexStandaloneDomain} from "../../../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexSendNativeDomainShard is FlexSendNativeDomainFacet {
    constructor()
        FlexSendNativeDomainFacet(
            FlexStandaloneDomain.calc(IFlexSendNative.flexSendNative.selector)
        )
    {}
}
