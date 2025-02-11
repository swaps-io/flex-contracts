// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexRefundNativeFacet} from "../../facets/FlexRefundNativeFacet.sol";

import {IFlexReceiveNative} from "../../interfaces/IFlexReceiveNative.sol";

import {FlexStandaloneDomain} from "../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexRefundNativeShard is FlexRefundNativeFacet {
    constructor()
        FlexRefundNativeFacet(
            FlexStandaloneDomain.calc(FlexRefundNativeFacet.flexRefundNative.selector),
            FlexStandaloneDomain.calc(IFlexReceiveNative.flexReceiveNative.selector)
        )
    {}
}
