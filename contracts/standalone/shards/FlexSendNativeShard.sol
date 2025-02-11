// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexSendNativeFacet} from "../../facets/FlexSendNativeFacet.sol";

import {FlexStandaloneDomain} from "../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexSendNativeShard is FlexSendNativeFacet {
    constructor()
        FlexSendNativeFacet(
            FlexStandaloneDomain.calc(FlexSendNativeFacet.flexSendNative.selector)
        )
    {}
}
