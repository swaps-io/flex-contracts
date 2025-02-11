// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexReceiveNativeFacet} from "../../facets/FlexReceiveNativeFacet.sol";

import {FlexStandaloneDomain} from "../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexReceiveNativeShard is FlexReceiveNativeFacet {
    constructor()
        FlexReceiveNativeFacet(
            FlexStandaloneDomain.calc(FlexReceiveNativeFacet.flexReceiveNative.selector)
        )
    {}
}
