// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexReceiveNativeDomainFacet} from "../../../../facets/views/domains/FlexReceiveNativeDomainFacet.sol";

import {IFlexReceiveNative} from "../../../../interfaces/IFlexReceiveNative.sol";

import {FlexStandaloneDomain} from "../../../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexReceiveNativeDomainShard is FlexReceiveNativeDomainFacet {
    constructor()
        FlexReceiveNativeDomainFacet(
            FlexStandaloneDomain.calc(IFlexReceiveNative.flexReceiveNative.selector)
        )
    {}
}
