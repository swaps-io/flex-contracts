// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.28;

import {FlexConfirmNativeFacet} from "../../facets/FlexConfirmNativeFacet.sol";

import {IFlexReceiveNative} from "../../interfaces/IFlexReceiveNative.sol";

import {FlexStandaloneDomain} from "../../libraries/utilities/FlexStandaloneDomain.sol";

contract FlexConfirmNativeShard is FlexConfirmNativeFacet {
    constructor()
        FlexConfirmNativeFacet(
            FlexStandaloneDomain.calc(FlexConfirmNativeFacet.flexConfirmNative.selector),
            FlexStandaloneDomain.calc(IFlexReceiveNative.flexReceiveNative.selector)
        )
    {}
}
